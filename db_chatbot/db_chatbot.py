import os
import pandas as pd
import pyodbc
from openai import AzureOpenAI
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import json
from typing import List, Dict, Any, Optional
import numpy as np
from io import StringIO
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import urllib.parse
import warnings
import time
from .advanced_queries import NATURAL_LANGUAGE_EXAMPLES
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import textwrap

# Load environment variables from .env file
load_dotenv()

# Database connection settings
AZURE_SQL_CONNECTION_STRING = os.getenv('AZURE_SQL_CONNECTION_STRING')
if not AZURE_SQL_CONNECTION_STRING:
    raise ValueError("AZURE_SQL_CONNECTION_STRING environment variable is not set")

# Azure OpenAI settings
AZURE_OPENAI_API_KEY = os.getenv('AZURE_OPENAI_API_KEY')
if not AZURE_OPENAI_API_KEY:
    raise ValueError("AZURE_OPENAI_API_KEY environment variable is not set")

AZURE_OPENAI_VERSION = os.getenv('AZURE_OPENAI_VERSION', '2024-02-15-preview')
AZURE_OPENAI_DEPLOYMENT = os.getenv('AZURE_OPENAI_DEPLOYMENT')
if not AZURE_OPENAI_DEPLOYMENT:
    raise ValueError("AZURE_OPENAI_DEPLOYMENT environment variable is not set")

AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT')
if not AZURE_OPENAI_ENDPOINT:
    raise ValueError("AZURE_OPENAI_ENDPOINT environment variable is not set")

# Suppress specific FutureWarning
warnings.filterwarnings('ignore', category=FutureWarning, module='seaborn.categorical')

class ChatMemory:
    def __init__(self, max_turns: int = 10):
        self.max_turns = max_turns
        self.conversation_history: List[Dict[str, Any]] = []
        self.current_context = {
            'last_topic': None,
            'last_department': None,
            'last_metric': None,
            'last_query': None,
            'last_results': None,
            'last_analysis': None,
            'query_history': []
        }
        
    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.conversation_history.append(message)
        
        # Update context based on message content and metadata
        if role == 'user':
            self.current_context['last_query'] = content
            self.current_context['query_history'].append(content)
            if len(self.current_context['query_history']) > self.max_turns:
                self.current_context['query_history'] = self.current_context['query_history'][-self.max_turns:]
        
        if metadata:
            if 'results' in metadata:
                self.current_context['last_results'] = metadata['results']
            if 'analysis' in metadata:
                self.current_context['last_analysis'] = metadata['analysis']
            if 'topic' in metadata:
                self.current_context['last_topic'] = metadata['topic']
            if 'department' in metadata:
                self.current_context['last_department'] = metadata['department']
            if 'metric' in metadata:
                self.current_context['last_metric'] = metadata['metric']
        
        if len(self.conversation_history) > self.max_turns * 2:
            self.conversation_history = self.conversation_history[-self.max_turns*2:]
    
    def get_context(self) -> List[Dict[str, Any]]:
        return self.conversation_history
    
    def get_current_context(self) -> Dict[str, Any]:
        return self.current_context
    
    def clear(self):
        self.conversation_history = []
        self.current_context = {
            'last_topic': None,
            'last_department': None,
            'last_metric': None,
            'last_query': None,
            'last_results': None,
            'last_analysis': None,
            'query_history': []
        }

    def get_formatted_history(self) -> str:
        return "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in self.conversation_history
        ])

class DatabaseChatbot:
    def __init__(self, connection_string=None, api_key=None, api_version=None, deployment_name=None, endpoint=None):
        """Initialize the chatbot with conversation context and state management."""
        self.conn = None
        self.last_query = None
        self.last_analysis = None
        self.conversation_context = {
            'last_topic': None,
            'last_department': None,
            'last_metric': None,
            'query_history': []
        }
        self.chat_memory = ChatMemory()
        
        # Store configuration
        self.connection_string = connection_string or AZURE_SQL_CONNECTION_STRING
        self.api_key = api_key or AZURE_OPENAI_API_KEY
        self.api_version = api_version or AZURE_OPENAI_VERSION
        self.deployment_name = deployment_name or AZURE_OPENAI_DEPLOYMENT
        self.endpoint = endpoint or AZURE_OPENAI_ENDPOINT
        
        self.initialize_database()
        print("Database Chatbot initialized successfully!")
        self.print_help()

    def print_help(self):
        """Print enhanced help information with examples and guidance."""
        print("\nAvailable commands:")
        print("- 'export <format> <query>': Export results")
        print("  Formats: csv, sql, excel, json")
        print("- 'quit': Exit the program")
        print("- 'help': Show this help message")
        print("- 'context': Show current conversation context")
        print("- 'suggest': Get query suggestions based on current context")
        
        print("\nExample queries:")
        print("- show me all employees")
        print("- what are the top 5 highest paid employees?")
        print("- how many employees are in each department?")
        print("- group the results by department")
        print("- show me project performance metrics")
        print("- analyze employee performance and contributions")
        print("- give me department analysis")
        print("- show me time-based trends")
        print("- analyze employee skills")
        print("- show me project success metrics")
        
        print("\nThe chatbot will automatically:")
        print("- Generate appropriate SQL queries")
        print("- Provide data analysis and insights")
        print("- Create relevant visualizations")
        print("- Maintain conversation context")
        print("- Suggest related queries")
        print("- Handle errors gracefully")

    def update_conversation_context(self, query, analysis=None):
        """Update the conversation context based on the current query and analysis."""
        self.conversation_context['query_history'].append(query)
        
        # Extract topic from query
        query = query.lower()
        
        # Department detection
        if 'department' in query:
            self.conversation_context['last_topic'] = 'department'
            # Try to extract specific department
            for dept in ['engineering', 'sales', 'marketing', 'hr', 'finance']:
                if dept in query:
                    self.conversation_context['last_department'] = dept
                    break
        
        # Metric detection
        if 'salary' in query or 'paid' in query:
            self.conversation_context['last_metric'] = 'salary'
        elif 'performance' in query or 'score' in query:
            self.conversation_context['last_metric'] = 'performance'
        elif 'skills' in query:
            self.conversation_context['last_topic'] = 'skills'
        
        # Time-based detection
        if 'trend' in query or 'time' in query or 'year' in query:
            self.conversation_context['last_topic'] = 'time'
        
        # Store the last query for reference
        self.last_query = query
        
        if analysis:
            self.last_analysis = analysis

    def get_suggested_queries(self):
        """Generate relevant query suggestions based on conversation context."""
        suggestions = []
        
        # Get current context
        context = self.chat_memory.get_current_context()
        last_topic = context.get('last_topic')
        last_department = context.get('last_department')
        last_metric = context.get('last_metric')
        last_query = context.get('last_query', '')
        recent_queries = context.get('query_history', [])
        
        # Default suggestions if no context
        default_suggestions = [
            "Show me all employees",
            "What are the top 5 highest paid employees?",
            "How many employees are in each department?",
            "Show me project performance metrics",
            "Analyze employee performance and contributions"
        ]
        
        if not any([last_topic, last_department, last_metric]):
            return [s for s in default_suggestions if s.lower() not in [q.lower() for q in recent_queries]]
        
        # 1. Department-based suggestions
        if last_topic == 'department' or last_department:
            if last_department:
                # Specific department suggestions
                dept_suggestions = [
                    f"Show me the top performers in {last_department}",
                    f"What is the average salary in {last_department}?",
                    f"List all employees in {last_department} by performance score",
                    f"Show me the skills distribution in {last_department}",
                    f"Compare {last_department} performance with other departments"
                ]
                suggestions.extend([s for s in dept_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
            
            # General department suggestions
            general_dept_suggestions = [
                "Compare department performance metrics",
                "Show me department-wise salary distribution",
                "Which department has the highest average performance?",
                "Show me the largest department by employee count",
                "Compare department hiring trends"
            ]
            suggestions.extend([s for s in general_dept_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # 2. Salary-based suggestions
        if last_metric == 'salary' or 'salary' in last_query.lower():
            salary_suggestions = [
                "Show me salary trends over time",
                "Compare salaries across departments",
                "Who are the top 5 highest paid employees?",
                "Show me the salary distribution by department",
                "What's the salary range in each department?"
            ]
            suggestions.extend([s for s in salary_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # 3. Performance-based suggestions
        if last_metric == 'performance' or 'performance' in last_query.lower():
            performance_suggestions = [
                "Show me performance trends over time",
                "Compare performance across departments",
                "Who are the top 5 performers?",
                "Show me the performance distribution",
                "Which department has the most consistent performance?"
            ]
            suggestions.extend([s for s in performance_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # 4. Skills-based suggestions
        if last_topic == 'skills' or 'skills' in last_query.lower():
            skills_suggestions = [
                "Show me employees with specific skills",
                "What are the most common skills?",
                "Which skills are associated with higher salaries?",
                "Show me skill distribution by department",
                "Which skills are most common in top performers?"
            ]
            suggestions.extend([s for s in skills_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # 5. Time-based suggestions
        if last_topic == 'time' or any(word in last_query.lower() for word in ['trend', 'time', 'year', 'month', 'date']):
            time_suggestions = [
                "Show me hiring trends by department",
                "Compare hiring patterns across years",
                "Show me employee retention rates",
                "Which department has grown the most?",
                "Show me the average tenure by department"
            ]
            suggestions.extend([s for s in time_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # 6. General suggestions (always included)
        general_suggestions = [
            "Show me recent hiring trends",
            "Analyze employee performance distribution",
            "Compare department sizes",
            "Show me the overall salary distribution",
            "What are the most common skills?"
        ]
        
        # Add general suggestions if we don't have enough context-specific ones
        if len(suggestions) < 3:
            suggestions.extend([s for s in general_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # If we still don't have enough suggestions, add from default suggestions
        if len(suggestions) < 3:
            suggestions.extend([s for s in default_suggestions if s.lower() not in [q.lower() for q in recent_queries]])
        
        # Remove duplicates and limit to 5 suggestions
        suggestions = list(dict.fromkeys(suggestions))[:5]
        
        return suggestions

    def handle_error(self, error, query):
        """Provide helpful error messages and suggestions."""
        error_message = str(error)
        
        if "syntax error" in error_message.lower():
            print("\nI had trouble understanding your query. Here are some suggestions:")
            print("1. Try rephrasing your question")
            print("2. Use simpler language")
            print("3. Break down complex questions into smaller parts")
            print("\nExample: Instead of 'show me everything about employees and their performance'")
            print("Try: 'show me all employees' followed by 'show me their performance scores'")
        
        elif "no such column" in error_message.lower():
            print("\nI couldn't find some of the data you're looking for. Available columns are:")
            print("- id, name, department, salary, doj, manager_id, performance_score, skills")
            print("\nTry rephrasing your query using these column names.")
        
        elif "no such table" in error_message.lower():
            print("\nI couldn't find the table you're looking for. Available tables are:")
            print("- employees, projects, departments")
            print("\nTry rephrasing your query using these table names.")
        
        else:
            print(f"\nAn error occurred: {error_message}")
            print("Would you like to:")
            print("1. Try a different query")
            print("2. See example queries (type 'help')")
            print("3. Get suggestions based on context (type 'suggest')")

    def process_query(self, query):
        """Process user query with enhanced error handling and context management."""
        try:
            if query.lower() == 'help':
                self.print_help()
                return
            
            if query.lower() == 'context':
                context = self.chat_memory.get_current_context()
                print("\nCurrent Conversation Context:")
                print(f"Last Topic: {context['last_topic']}")
                print(f"Last Department: {context['last_department']}")
                print(f"Last Metric: {context['last_metric']}")
                print("\nRecent Queries:")
                for q in context['query_history'][-3:]:
                    print(f"- {q}")
                return
            
            if query.lower() == 'suggest':
                print("\nSuggested queries based on context:")
                for i, suggestion in enumerate(self.get_suggested_queries(), 1):
                    print(f"{i}. {suggestion}")
                return
            
            # Add user query to memory
            self.chat_memory.add_message('user', query)
            
            # Generate and execute SQL query
            sql_query = self.generate_sql_query(query)
            results = self.execute_query(sql_query)
            
            if results is not None and not results.empty:
                # Add SQL query to memory
                self.chat_memory.add_message('assistant', sql_query, {'type': 'sql'})
                
                print("\nQuery Results:")
                print(results)
                
                # Generate analysis
                analysis = self.analyze_data(results)
                print("\nAnalysis:")
                print(analysis)
                
                # Add results and analysis to memory with metadata
                self.chat_memory.add_message('assistant', str(results), {
                    'type': 'results',
                    'data': results.to_dict('records'),
                    'topic': self.extract_topic(query),
                    'department': self.extract_department(query),
                    'metric': self.extract_metric(query)
                })
                
                self.chat_memory.add_message('assistant', analysis, {
                    'type': 'analysis',
                    'data': analysis
                })
                
                # Generate visualizations
                viz_message = self.visualize_data(results)
                print("\n" + viz_message)
                
                # Provide follow-up suggestions
                print("\nYou might also want to know:")
                for suggestion in self.get_suggested_queries()[:3]:
                    print(f"- {suggestion}")
            
        except Exception as e:
            self.handle_error(e, query)

    def extract_topic(self, query: str) -> Optional[str]:
        """Extract the main topic from a query."""
        query = query.lower()
        topics = {
            'department': ['department', 'dept'],
            'salary': ['salary', 'paid', 'compensation'],
            'performance': ['performance', 'score', 'rating'],
            'skills': ['skills', 'expertise', 'capabilities'],
            'time': ['trend', 'time', 'year', 'month', 'date']
        }
        
        for topic, keywords in topics.items():
            if any(keyword in query for keyword in keywords):
                return topic
        return None
        
    def extract_department(self, query: str) -> Optional[str]:
        """Extract department from a query."""
        query = query.lower()
        departments = ['engineering', 'sales', 'marketing', 'hr', 'finance']
        for dept in departments:
            if dept in query:
                return dept
        return None
        
    def extract_metric(self, query: str) -> Optional[str]:
        """Extract metric from a query."""
        query = query.lower()
        metrics = {
            'salary': ['salary', 'paid', 'compensation'],
            'performance': ['performance', 'score', 'rating'],
            'count': ['count', 'number', 'how many'],
            'average': ['average', 'mean', 'avg']
        }
        
        for metric, keywords in metrics.items():
            if any(keyword in query for keyword in keywords):
                return metric
        return None

    def initialize_database(self):
        """Initialize database connection and OpenAI client."""
        try:
            # Initialize OpenAI client
            self.client = AzureOpenAI(
                api_key=self.api_key,
                api_version=self.api_version,
                azure_endpoint=self.endpoint
            )
            
            # Initialize database connection
            params = urllib.parse.quote_plus(self.connection_string)
            engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
            self.conn = engine.connect()
            print("Successfully connected to the database!")
            
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            raise

    def get_schema_info(self) -> str:
        """Get database schema information."""
        try:
            cursor = self.conn.cursor()
            
            # Get table information
            cursor.execute("""
                SELECT 
                    t.name AS table_name,
                    c.name AS column_name,
                    ty.name AS data_type,
                    c.max_length,
                    c.precision,
                    c.scale,
                    c.is_nullable
                FROM sys.tables t
                INNER JOIN sys.columns c ON t.object_id = c.object_id
                INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
                ORDER BY t.name, c.column_id;
            """)
            
            # Get results
            columns = [column[0] for column in cursor.description]
            results = cursor.fetchall()
            
            # Create DataFrame
            schema_df = pd.DataFrame(results, columns=columns)
            
            # Close cursor
            cursor.close()
            
            # Format schema information
            schema_info = []
            current_table = None
            
            for _, row in schema_df.iterrows():
                if row['table_name'] != current_table:
                    current_table = row['table_name']
                    schema_info.append(f"\nTable: {current_table}")
                    schema_info.append("-" * (len(current_table) + 7))
                
                nullable = "NULL" if row['is_nullable'] else "NOT NULL"
                schema_info.append(f"  {row['column_name']}: {row['data_type']} {nullable}")
            
            return "\n".join(schema_info)
            
        except Exception as e:
            raise Exception(f"Error getting schema information: {str(e)}")

    def generate_sql_query(self, query: str) -> str:
        """Generate SQL query from natural language input."""
        try:
            # Define expected columns
            expected_columns = [
                'id', 'name', 'department', 'salary', 
                'doj', 'manager_id', 'performance_score', 'skills'
            ]
            
            # Simple query mapping for common requests
            query = query.lower().strip()
            
            # Base SELECT statement with all columns
            base_select = f"""
                SELECT 
                    {', '.join(expected_columns)}
                FROM employees
            """
            
            if query == "show me all employees":
                return base_select
            
            if "top" in query and "paid" in query:
                limit = 5  # default
                if "5" in query:
                    limit = 5
                elif "10" in query:
                    limit = 10
                return f"""
                    SELECT TOP {limit}
                        {', '.join(expected_columns)}
                    FROM employees 
                    ORDER BY salary DESC
                """
            
            if "how many employees" in query and "department" in query:
                return """
                    SELECT 
                        department,
                        COUNT(*) as employee_count 
                    FROM employees 
                    GROUP BY department
                """
            
            if "group" in query and "department" in query:
                return """
                    SELECT 
                        department,
                        COUNT(*) as employee_count,
                        AVG(salary) as avg_salary,
                        AVG(performance_score) as avg_performance
                    FROM employees 
                    GROUP BY department
                """
            
            if "performance" in query:
                return """
                    SELECT 
                        department,
                        AVG(performance_score) as avg_performance,
                        COUNT(*) as employee_count
                    FROM employees
                    GROUP BY department
                    ORDER BY avg_performance DESC
                """
            
            if "skills" in query:
                return """
                    SELECT 
                        department,
                        STRING_AGG(DISTINCT skills, ', ') as unique_skills,
                        COUNT(DISTINCT skills) as skill_count
                    FROM employees
                    GROUP BY department
                """
            
            if "trends" in query or "hiring" in query:
                return """
                    SELECT 
                        YEAR(doj) as hire_year,
                        COUNT(*) as new_employees
                    FROM employees
                    GROUP BY YEAR(doj)
                    ORDER BY hire_year
                """
            
            # Default query if no specific pattern matches
            return base_select
            
        except Exception as e:
            raise Exception(f"Error generating SQL query: {str(e)}")

    def execute_query(sql_query: str) -> List[Dict[str, Any]]:
        try:
            with engine.connect() as conn:
                result = conn.execute(text(sql_query))
                columns = result.keys()
                rows = result.fetchall()
                print(f"📊 Columns: {columns}")
                for idx, row in enumerate(rows):
                    print(f"Row {idx}: {row}")
                return [{col: val for col, val in zip(columns, row)} for row in rows]
        except Exception as e:
            print("❌ Exception in execute_query:", e)
            raise HTTPException(status_code=400, detail=str(e))

    def analyze_data(self, df: pd.DataFrame) -> str:
        """Analyze data and return focused, actionable insights."""
        try:
            analysis = []
            
            # 1. Quick Summary
            analysis.append("📊 QUICK SUMMARY")
            analysis.append("=" * 50)
            analysis.append(f"Total Employees: {len(df):,}")
            if 'department' in df.columns:
                dept_counts = df['department'].value_counts()
                analysis.append("\nDepartment Distribution:")
                for dept, count in dept_counts.items():
                    analysis.append(f"  • {dept}: {count:,} employees")
            
            # 2. Key Metrics
            analysis.append("\n📈 KEY METRICS")
            analysis.append("=" * 50)
            
            if 'salary' in df.columns:
                analysis.append("\nSalary Analysis:")
                analysis.append(f"  • Average Salary: ${df['salary'].mean():,.2f}")
                analysis.append(f"  • Highest Salary: ${df['salary'].max():,.2f}")
                analysis.append(f"  • Lowest Salary: ${df['salary'].min():,.2f}")
                
                if 'department' in df.columns:
                    dept_salaries = df.groupby('department')['salary'].agg(['mean', 'min', 'max'])
                    analysis.append("\nSalary by Department:")
                    for dept, stats in dept_salaries.iterrows():
                        analysis.append(f"  • {dept}:")
                        analysis.append(f"    - Average: ${stats['mean']:,.2f}")
                        analysis.append(f"    - Range: ${stats['min']:,.2f} - ${stats['max']:,.2f}")
            
            if 'performance_score' in df.columns:
                analysis.append("\nPerformance Analysis:")
                analysis.append(f"  • Average Performance: {df['performance_score'].mean():.2f}/5.0")
                analysis.append(f"  • Top Performers: {len(df[df['performance_score'] >= 4.5]):,} employees")
                
                if 'department' in df.columns:
                    dept_performance = df.groupby('department')['performance_score'].mean()
                    analysis.append("\nPerformance by Department:")
                    for dept, score in dept_performance.items():
                        analysis.append(f"  • {dept}: {score:.2f}/5.0")
            
            # 3. Skills Analysis
            if 'skills' in df.columns:
                analysis.append("\n🔧 SKILLS ANALYSIS")
                analysis.append("=" * 50)
                
                # Count individual skills
                all_skills = []
                for skills in df['skills']:
                    all_skills.extend([s.strip() for s in skills.split(',')])
                skill_counts = pd.Series(all_skills).value_counts()
                
                analysis.append("\nTop Skills:")
                for skill, count in skill_counts.head(5).items():
                    analysis.append(f"  • {skill}: {count:,} employees")
            
            # 4. Hiring Trends
            if 'doj' in df.columns:
                analysis.append("\n📅 HIRING TRENDS")
                analysis.append("=" * 50)
                
                df['doj'] = pd.to_datetime(df['doj'])
                yearly_hires = df.groupby(df['doj'].dt.year).size()
                
                analysis.append("\nYearly Hiring:")
                for year, count in yearly_hires.items():
                    analysis.append(f"  • {year}: {count:,} new employees")
            
            # 5. Key Insights
            analysis.append("\n💡 KEY INSIGHTS")
            analysis.append("=" * 50)
            
            # Add insights based on the data
            if 'salary' in df.columns and 'department' in df.columns:
                highest_paid_dept = df.groupby('department')['salary'].mean().idxmax()
                analysis.append(f"  • {highest_paid_dept} department has the highest average salary")
            
            if 'performance_score' in df.columns and 'department' in df.columns:
                best_performing_dept = df.groupby('department')['performance_score'].mean().idxmax()
                analysis.append(f"  • {best_performing_dept} department shows the best performance")
            
            if 'skills' in df.columns:
                most_common_skill = skill_counts.index[0]
                analysis.append(f"  • {most_common_skill} is the most common skill")
            
            return "\n".join(analysis)
            
        except Exception as e:
            return f"Error analyzing data: {str(e)}"

    def visualize_data(self, df: pd.DataFrame) -> str:
        """Create beautiful and interactive visualizations based on data."""
        try:
            # Create timestamp for unique filenames
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"visualization_{timestamp}"
            
            # Create visualizations directory if it doesn't exist
            os.makedirs('visualizations', exist_ok=True)
            
            # Get numeric and categorical columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            categorical_cols = df.select_dtypes(include=['object']).columns
            
            visualizations = []
            insights = []
            
            # 1. Department Distribution (if department column exists)
            if 'department' in df.columns:
                # Create a beautiful pie chart with plotly
                fig = px.pie(
                    df, 
                    names='department',
                    title='Employee Distribution by Department',
                    color_discrete_sequence=px.colors.qualitative.Set3
                )
                fig.update_traces(textposition='inside', textinfo='percent+label')
                fig.update_layout(
                    title_x=0.5,
                    title_font_size=20,
                    showlegend=True,
                    legend_title="Departments"
                )
                fig.write_html(f'visualizations/{base_filename}_department_pie.html')
                visualizations.append(f'visualizations/{base_filename}_department_pie.html')
                
                # Add insight
                dept_counts = df['department'].value_counts()
                largest_dept = dept_counts.index[0]
                smallest_dept = dept_counts.index[-1]
                insights.append(f"• {largest_dept} is the largest department with {dept_counts[largest_dept]} employees")
                insights.append(f"• {smallest_dept} is the smallest department with {dept_counts[smallest_dept]} employees")
            
            # 2. Salary Analysis (if salary column exists)
            if 'salary' in df.columns:
                # Create a beautiful box plot
                fig = px.box(
                    df,
                    x='department',
                    y='salary',
                    title='Salary Distribution by Department',
                    color='department',
                    points='all',
                    color_discrete_sequence=px.colors.qualitative.Set3
                )
                fig.update_layout(
                    title_x=0.5,
                    title_font_size=20,
                    xaxis_title="Department",
                    yaxis_title="Salary",
                    showlegend=False
                )
                fig.write_html(f'visualizations/{base_filename}_salary_box.html')
                visualizations.append(f'visualizations/{base_filename}_salary_box.html')
                
                # Add salary insights
                avg_salary = df['salary'].mean()
                max_salary = df['salary'].max()
                min_salary = df['salary'].min()
                insights.append(f"• Average salary across all departments: ${avg_salary:,.2f}")
                insights.append(f"• Salary range: ${min_salary:,.2f} - ${max_salary:,.2f}")
            
            # 3. Performance Analysis (if performance_score exists)
            if 'performance_score' in df.columns:
                # Create a beautiful scatter plot
                fig = px.scatter(
                    df,
                    x='salary',
                    y='performance_score',
                    color='department',
                    title='Performance vs Salary by Department',
                    size='performance_score',
                    hover_data=['department'],
                    color_discrete_sequence=px.colors.qualitative.Set3
                )
                fig.update_layout(
                    title_x=0.5,
                    title_font_size=20,
                    xaxis_title="Salary",
                    yaxis_title="Performance Score"
                )
                fig.write_html(f'visualizations/{base_filename}_performance_scatter.html')
                visualizations.append(f'visualizations/{base_filename}_performance_scatter.html')
                
                # Add performance insights
                best_performer = df.loc[df['performance_score'].idxmax()]
                insights.append(f"• Best performing employee: {best_performer['name']} in {best_performer['department']} with score {best_performer['performance_score']}")
            
            # 4. Time-based Analysis (if doj exists)
            if 'doj' in df.columns:
                df['doj'] = pd.to_datetime(df['doj'])
                yearly_counts = df.groupby(df['doj'].dt.year)['id'].count().reset_index()
                yearly_counts.columns = ['Year', 'Count']
                
                # Create a beautiful line chart
                fig = px.line(
                    yearly_counts,
                    x='Year',
                    y='Count',
                    title='Employee Hiring Trends Over Time',
                    markers=True
                )
                fig.update_layout(
                    title_x=0.5,
                    title_font_size=20,
                    xaxis_title="Year",
                    yaxis_title="Number of Employees Hired"
                )
                fig.write_html(f'visualizations/{base_filename}_hiring_trends.html')
                visualizations.append(f'visualizations/{base_filename}_hiring_trends.html')
                
                # Add hiring trend insights
                max_year = yearly_counts.loc[yearly_counts['Count'].idxmax()]
                insights.append(f"• Highest hiring year: {max_year['Year']} with {max_year['Count']} new employees")
            
            # 5. Skills Analysis (if skills exists)
            if 'skills' in df.columns:
                # Split skills and count occurrences
                all_skills = []
                for skills in df['skills']:
                    all_skills.extend([s.strip() for s in skills.split(',')])
                skill_counts = pd.Series(all_skills).value_counts().head(10)
                
                # Create a beautiful bar chart
                fig = px.bar(
                    x=skill_counts.index,
                    y=skill_counts.values,
                    title='Top 10 Skills Distribution',
                    color=skill_counts.values,
                    color_continuous_scale='Viridis'
                )
                fig.update_layout(
                    title_x=0.5,
                    title_font_size=20,
                    xaxis_title="Skills",
                    yaxis_title="Count",
                    xaxis_tickangle=45
                )
                fig.write_html(f'visualizations/{base_filename}_skills_dist.html')
                visualizations.append(f'visualizations/{base_filename}_skills_dist.html')
                
                # Add skills insights
                top_skill = skill_counts.index[0]
                insights.append(f"• Most common skill: {top_skill} with {skill_counts[top_skill]} employees")
            
            # Generate a beautiful HTML report
            report = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; }}
                    .container {{ max-width: 1200px; margin: 0 auto; }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .insights {{ background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
                    .visualizations {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
                    .viz-item {{ border: 1px solid #ddd; padding: 10px; border-radius: 5px; }}
                    h1 {{ color: #2c3e50; }}
                    h2 {{ color: #34495e; }}
                    li {{ margin-bottom: 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Data Analysis Report</h1>
                        <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    <div class="insights">
                        <h2>Key Insights</h2>
                        <ul>
                            {''.join(f'<li>{insight}</li>' for insight in insights)}
                        </ul>
                    </div>
                    
                    <div class="visualizations">
                        <h2>Interactive Visualizations</h2>
                        {''.join(f'<div class="viz-item"><iframe src="{viz}" width="100%" height="400px" frameborder="0"></iframe></div>' for viz in visualizations)}
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Save the report
            with open(f'visualizations/{base_filename}_report.html', 'w') as f:
                f.write(report)
            
            return f"""
            📊 Beautiful visualizations have been created! 
            
            🔍 Key Insights:
            {chr(10).join(insights)}
            
            📈 Interactive visualizations are available in the 'visualizations' directory.
            📄 A comprehensive HTML report has been generated: visualizations/{base_filename}_report.html
            
            💡 Suggested next queries:
            {self.get_suggested_queries()}
            """
            
        except Exception as e:
            print(f"Error creating visualizations: {str(e)}")
            return "Error creating visualizations"

    def export_data(self, df: pd.DataFrame, format: str = 'csv') -> str:
        """Export data in various formats with enhanced metadata."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if format.lower() == 'csv':
                filename = f'query_results_{timestamp}.csv'
                # Add metadata as comments
                with open(filename, 'w') as f:
                    f.write(f"# Generated: {datetime.now()}\n")
                    f.write(f"# Total Rows: {len(df)}\n")
                    f.write(f"# Columns: {', '.join(df.columns)}\n\n")
                df.to_csv(filename, mode='a', index=False)
                return f"Data exported to {filename}"
                
            elif format.lower() == 'sql':
                filename = f'query_results_{timestamp}.sql'
                with open(filename, 'w') as f:
                    f.write(f"-- Generated: {datetime.now()}\n")
                    f.write(f"-- Total Rows: {len(df)}\n")
                    f.write(f"-- Columns: {', '.join(df.columns)}\n\n")
                    f.write("INSERT INTO query_results (")
                    f.write(", ".join(df.columns))
                    f.write(") VALUES\n")
                    
                    for i, row in df.iterrows():
                        values = []
                        for val in row:
                            if pd.isna(val):
                                values.append("NULL")
                            elif isinstance(val, (int, float)):
                                values.append(str(val))
                            else:
                                values.append(f"'{str(val)}'")
                        f.write("(" + ", ".join(values) + ")")
                        if i < len(df) - 1:
                            f.write(",\n")
                        else:
                            f.write(";\n")
                return f"Data exported to {filename}"
                
            elif format.lower() == 'excel':
                filename = f'query_results_{timestamp}.xlsx'
                with pd.ExcelWriter(filename) as writer:
                    # Main data sheet
                    df.to_excel(writer, sheet_name='Data', index=False)
                    
                    # Summary sheet
                    summary_df = pd.DataFrame({
                        'Metric': ['Total Rows', 'Columns', 'Generated'],
                        'Value': [len(df), len(df.columns), datetime.now()]
                    })
                    summary_df.to_excel(writer, sheet_name='Summary', index=False)
                    
                    # Statistics sheet for numeric columns
                    if len(df.select_dtypes(include=[np.number]).columns) > 0:
                        df.describe().to_excel(writer, sheet_name='Statistics')
                return f"Data exported to {filename}"
                
            elif format.lower() == 'json':
                filename = f'query_results_{timestamp}.json'
                export_data = {
                    'metadata': {
                        'generated': str(datetime.now()),
                        'total_rows': len(df),
                        'columns': list(df.columns)
                    },
                    'data': df.to_dict(orient='records')
                }
                with open(filename, 'w') as f:
                    json.dump(export_data, f, indent=2)
                return f"Data exported to {filename}"
                
            else:
                return "Unsupported export format. Please use 'csv', 'sql', 'excel', or 'json'."
                
        except Exception as e:
            return f"Error exporting data: {str(e)}"

def main():
    """Main function to run the chatbot."""
    # Load environment variables
    load_dotenv()
    
    # Initialize chatbot
    chatbot = DatabaseChatbot()
    
    # Main interaction loop
    while True:
        query = input("Enter your question (or 'quit' to exit): ").strip()
        
        if query.lower() == 'quit':
            break
        else:
            chatbot.process_query(query)

if __name__ == "__main__":
    main() 