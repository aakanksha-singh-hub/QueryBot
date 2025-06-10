import openai
print("OPENAI VERSION:", openai.__version__)
print("OPENAI FILE:", openai.__file__)

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import openai
import json
import logging
from datetime import datetime
import io
import csv
from tenacity import retry, stop_after_attempt, wait_exponential

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Database Voice Chatbot")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")
print("🔥 Loaded DATABASE_URL:", DATABASE_URL) # <--- ADD THIS LINE
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Azure OpenAI setup
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT:
    raise ValueError("Azure OpenAI credentials are not set")

openai.api_key = AZURE_OPENAI_API_KEY
openai.api_base = AZURE_OPENAI_ENDPOINT
openai.api_type = "azure"
openai.api_version = "2023-05-15"

# Models
class QueryInput(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None

class SuggestionRequest(BaseModel):
    question: str

class ExportRequest(BaseModel):
    data: List[Dict[str, Any]]

# Utility: Get schema
def get_schema_info():
    with engine.connect() as conn:
        tables_query = text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'dbo'
    """)
        tables = [row[0] for row in conn.execute(tables_query)]
        schema = {}
        for table in tables:
            columns_query = text(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table}'
            """)
            columns = [{"name": row[0], "type": row[1]} for row in conn.execute(columns_query)]
            schema[table] = columns
        return schema

# Utility: Format schema
def format_schema_for_prompt(schema_info):
    lines = []
    for table, columns in schema_info.items():
        lines.append(f"Table: {table}")
        for col in columns:
            lines.append(f"- {col['name']} ({col['type']})")
        lines.append("")
    return "\n".join(lines)

# Utility: Generate SQL from natural query
def generate_sql(natural_query: str, schema_info: dict) -> Dict[str, str]:
    schema_str = format_schema_for_prompt(schema_info)
    prompt = f"""
You are a data analyst AI assistant. Given the following schema:
{schema_str}
Generate a SQL query (T-SQL for Azure SQL) that answers this natural language question:
"{natural_query}"
Format your response as JSON like this:
{{
    "sql_query": "...",
    "explanation": "..."
}}
"""
    try:
        # Use get_completion to handle OpenAI call, retry, and markdown stripping
        message = get_completion(
            messages=[
                {"role": "system", "content": "You are an expert SQL assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        print("🧠 RAW OPENAI MESSAGE (after cleaning in get_completion):", message)

        try:
            parsed = json.loads(message)
            print("🔍 PARSED:", parsed)
            print("TYPE:", type(parsed))

            return {
                "sql_query": parsed.get("sql_query", "").strip(),
                "explanation": parsed.get("explanation", "").strip()
            }
        except json.JSONDecodeError as e:
            print("❌ JSON Parse Error:", e)
            print("Raw message that failed to parse (after cleaning):", message)
            # Return a default response if JSON parsing fails
            return {
                "sql_query": "SELECT TOP 5 * FROM employees ORDER BY salary DESC",
                "explanation": "Showing top 5 highest paid employees"
            }
    except Exception as e:
        print("❌ OpenAI API Error or other error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# Utility: Execute SQL query
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

# API Router
api_router = APIRouter(prefix="/api")

@api_router.post("/query")
async def process_query(data: QueryInput):
    try:
        user_query = data.query or data.question
        if not user_query:
            return {"sql_query": "", "results": [], "explanation": "", "error": "No query provided"}

        schema_info = get_schema_info()
        response_data = generate_sql(user_query, schema_info)
        sql_query = response_data["sql_query"]
        explanation = response_data["explanation"]

        results = execute_query(sql_query)
        return {
            "sql_query": sql_query,
            "results": results,
            "explanation": explanation,
            "error": None
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "sql_query": "",
            "results": [],
            "explanation": "",
            "error": str(e)
        }

@api_router.post("/suggestions")
def suggest_followups(request: SuggestionRequest):
    prompt = f"""
Based on the user's question: "{request.question}",
suggest 3 follow-up analytical questions about employee data stored in a SQL database.
Format as JSON:
{{
    "suggestions": ["...", "...", "..."]
}}
"""
    try:
        response = openai.ChatCompletion.create(
            engine="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert data assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        message = response.choices[0].message.content
        suggestions = json.loads(message).get("suggestions", [])
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/export")
def export_csv(request: ExportRequest):
    try:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=request.data[0].keys())
        writer.writeheader()
        writer.writerows(request.data)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=export.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ping")
def ping():
    return {"status": "ok", "message": "pong"}

@app.get("/")
def root():
    return {"message": "Database Voice Chatbot API"}

@app.get("/schema")
def get_schema():
    try:
        schema_info = get_schema_info()
        return {"schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/transcribe")
def transcribe_audio():
    return {"message": "Audio transcription endpoint"}

# Include the API router
app.include_router(api_router)

DOMAIN_SCHEMAS = {
    "sales": {
        "tables": {
            "sales": ["sale_id", "project_id", "amount", "sale_date", "payment_status"],
            "projects": ["project_id", "project_name", "start_date", "end_date", "budget", "status", "client_name"]
        },
        "kpis": ["Total Revenue", "Sales per Project", "Average Sale Amount"],
        "system_prompt": """You are a sales analytics expert. You help users analyze sales data and project-related sales performance.
        Focus on metrics like total revenue, sales per project, and average sale amounts.
        
        Example queries and their SQL:
        1. "Show me total sales amount for each project"
           SELECT p.project_name, SUM(s.amount) AS total_sales_amount
           FROM sales s
           JOIN projects p ON s.project_id = p.project_id
           GROUP BY p.project_name
           ORDER BY total_sales_amount DESC;
        
        2. "What was the total revenue in March?"
           SELECT SUM(amount) AS total_revenue
           FROM sales
           WHERE MONTH(sale_date) = 3 AND YEAR(sale_date) = YEAR(GETDATE());
        
        3. "Show me sales by payment status"
           SELECT payment_status, COUNT(sale_id) AS number_of_sales, SUM(amount) AS total_amount
           FROM sales
           GROUP BY payment_status;
        """,
        "common_terms": {
            "total_revenue": "SUM(amount)",
            "sales_amount": "amount",
            "sales_date": "sale_date",
            "payment_status": "payment_status"
        }
    },
    "support": {
        "tables": {
            "customer_feedback": ["feedback_id", "project_id", "rating", "feedback_text", "feedback_date"],
            "projects": ["project_id", "project_name", "start_date", "end_date", "budget", "status", "client_name"]
        },
        "kpis": ["Average Rating", "Feedback Volume", "Feedback per Project"],
        "system_prompt": """You are a customer support and feedback analytics expert. You help users analyze customer feedback and relate it to projects.
        Focus on metrics like average ratings, volume of feedback, and specific feedback texts.
        
        Example queries and their SQL:
        1. "Show me the average rating for each project"
           SELECT p.project_name, AVG(cf.rating) AS average_rating
           FROM customer_feedback cf
           JOIN projects p ON cf.project_id = p.project_id
           GROUP BY p.project_name
           ORDER BY average_rating DESC;
        
        2. "How many feedback entries were received last month?"
           SELECT COUNT(feedback_id) AS total_feedback_last_month
           FROM customer_feedback
           WHERE MONTH(feedback_date) = MONTH(DATEADD(month, -1, GETDATE()))
           AND YEAR(feedback_date) = YEAR(DATEADD(month, -1, GETDATE()));
        
        3. "Show me all feedback for projects with low ratings (e.g., less than 3)"
           SELECT cf.feedback_text, cf.rating, p.project_name
           FROM customer_feedback cf
           JOIN projects p ON cf.project_id = p.project_id
           WHERE cf.rating < 3;
        """,
        "common_terms": {
            "average_rating": "AVG(rating)",
            "feedback_volume": "COUNT(feedback_id)",
            "feedback_date": "feedback_date"
        }
    },
    "employee": {
        "tables": {
            "employees": ["id", "name", "department", "salary", "doj", "manager_id", "performance_score", "skills"],
            "projects": ["project_id", "project_name", "start_date", "end_date", "budget", "status", "client_name"],
            "employee_projects": ["employee_id", "project_id", "role", "hours_worked", "contribution_percentage"]
        },
        "kpis": ["Employee Salary", "Department Performance", "Hours Worked on Projects", "Project Contribution"],
        "system_prompt": """You are an employee and project performance analytics expert. You help users analyze employee data, project involvement, and productivity metrics.
        Focus on metrics like employee salaries, department performance, hours worked on projects, and contribution percentages.
        
        Example queries and their SQL:
        1. "What is the average salary by department?"
           SELECT department, AVG(salary) AS average_salary FROM employees GROUP BY department;
        
        2. "Show me employees working on 'Project X' and their hours"
           SELECT e.name, ep.hours_worked
           FROM employees e
           JOIN employee_projects ep ON e.id = ep.employee_id
           JOIN projects p ON ep.project_id = p.project_id
           WHERE p.project_name = 'Project X';
        
        3. "Who are the top 5 highest paid employees?"
           SELECT TOP 5 name, salary, department FROM employees ORDER BY salary DESC;
        
        4. "List employees who started in the last year"
           SELECT id, name, doj, department
           FROM employees
           WHERE doj >= DATEADD(year, -1, GETDATE());
        """,
        "common_terms": {
            "average_salary": "AVG(salary)",
            "total_hours_worked": "SUM(hours_worked)",
            "department": "department",
            "salary": "salary"
        }
    }
}

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_completion(messages):
    try:
        response = openai.ChatCompletion.create(
            engine="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )
        message_content = response.choices[0].message.content
        # Robustly clean markdown code blocks from the message content
        if message_content.startswith('```json'):
            message_content = message_content[len('```json'):]
        if message_content.endswith('```'):
            message_content = message_content[:-len('```')]
        return message_content.strip()
    except Exception as e:
        print(f"Error in OpenAI API call: {str(e)}")
        raise 