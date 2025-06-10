import openai
print("OPENAI VERSION:", openai.__version__)
print("OPENAI FILE:", openai.__file__)

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
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
import azure.cognitiveservices.speech as speechsdk

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
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")
print("🔥 Loaded DATABASE_URL:", DATABASE_URL)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Azure OpenAI setup
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT:
    raise ValueError("Azure OpenAI credentials are not set")

openai.api_key = AZURE_OPENAI_API_KEY
openai.api_base = AZURE_OPENAI_ENDPOINT
openai.api_type = "azure"
openai.api_version = "2023-05-15"

# Azure Speech Service setup
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
    raise ValueError("Azure Speech Service credentials are not set")

speech_config = speechsdk.SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_SPEECH_REGION)
speech_config.speech_synthesis_voice_name='en-US-JennyNeural'

# Domain schemas for suggestions
DOMAIN_SCHEMAS = {
    "employees": {
        "tables": {
            "employees": {
                "id": "int",
                "name": "varchar",
                "department": "varchar",
                "salary": "decimal",
                "hire_date": "date",
                "manager_id": "int"
            }
        },
        "kpis": ["salary", "department", "tenure"],
        "system_prompt": """
        You are an expert data analyst focusing on employee data.
        Example queries and their SQL:
        1. Show me the top 5 highest paid employees
        SELECT TOP 5 name, salary FROM employees ORDER BY salary DESC
        2. What is the average salary by department?
        SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department
        3. Who are the managers and how many people report to them?
        SELECT m.name as manager_name, COUNT(e.id) as direct_reports 
        FROM employees e JOIN employees m ON e.manager_id = m.id 
        GROUP BY m.name
        """
    },
    "projects": {
        "tables": {
            "projects": {
                "id": "int",
                "name": "varchar",
                "start_date": "date",
                "end_date": "date",
                "status": "varchar",
                "budget": "decimal"
            },
            "employee_projects": {
                "employee_id": "int",
                "project_id": "int",
                "role": "varchar",
                "hours_worked": "decimal"
            }
        },
        "kpis": ["budget", "status", "hours_worked"],
        "system_prompt": """
        You are an expert data analyst focusing on project management data.
        Example queries and their SQL:
        1. What are the active projects and their budgets?
        SELECT name, budget FROM projects WHERE status = 'active'
        2. Which employees are working the most hours on projects?
        SELECT e.name, SUM(ep.hours_worked) as total_hours 
        FROM employee_projects ep JOIN employees e ON ep.employee_id = e.id 
        GROUP BY e.name ORDER BY total_hours DESC
        3. What is the average project budget by status?
        SELECT status, AVG(budget) as avg_budget FROM projects GROUP BY status
        """
    },
    "sales": {
        "tables": {
            "sales": {
                "id": "int",
                "product_id": "int",
                "customer_id": "int",
                "sale_date": "date",
                "amount": "decimal",
                "quantity": "int"
            }
        },
        "kpis": ["amount", "quantity", "sale_date"],
        "system_prompt": """
        You are an expert data analyst focusing on sales data.
        Example queries and their SQL:
        1. What are the total sales by month?
        SELECT MONTH(sale_date) as month, SUM(amount) as total_sales 
        FROM sales GROUP BY MONTH(sale_date) ORDER BY month
        2. Which products have the highest average sale amount?
        SELECT product_id, AVG(amount) as avg_sale_amount 
        FROM sales GROUP BY product_id ORDER BY avg_sale_amount DESC
        3. What is the total quantity sold per product?
        SELECT product_id, SUM(quantity) as total_quantity 
        FROM sales GROUP BY product_id ORDER BY total_quantity DESC
        """
    },
    "customer_feedback": {
        "tables": {
            "customer_feedback": {
                "id": "int",
                "customer_id": "int",
                "rating": "int",
                "comment": "text",
                "feedback_date": "date"
            }
        },
        "kpis": ["rating", "feedback_date"],
        "system_prompt": """
        You are an expert data analyst focusing on customer feedback.
        Example queries and their SQL:
        1. What is the average rating over time?
        SELECT feedback_date, AVG(rating) as avg_rating 
        FROM customer_feedback GROUP BY feedback_date ORDER BY feedback_date
        2. How many feedback entries do we have per rating?
        SELECT rating, COUNT(*) as count FROM customer_feedback GROUP BY rating
        3. What are the most recent feedback comments?
        SELECT TOP 5 comment, rating, feedback_date 
        FROM customer_feedback ORDER BY feedback_date DESC
        """
    }
}

# Models
class QueryInput(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None

class SuggestionRequest(BaseModel):
    domain: Optional[str] = None

class ExportRequest(BaseModel):
    data: List[Dict[str, Any]]

# Utility: Get schema
def get_schema_info(db: Session) -> Dict[str, Any]:
    schema = {}
    tables_query = text("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'dbo'
""")
    tables = [row[0] for row in db.execute(tables_query)]

    for table in tables:
        columns_query = text(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '{table}'
        """)
        columns = [{"name": row[0], "type": row[1]} for row in db.execute(columns_query)]
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
            return {
                "sql_query": "SELECT TOP 5 * FROM employees ORDER BY salary DESC",
                "explanation": "Showing top 5 highest paid employees"
            }
    except Exception as e:
        print("❌ OpenAI API Error or other error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# Utility: Execute SQL query
def execute_query(sql_query: str, db: Session) -> List[Dict[str, Any]]:
    try:
        result = db.execute(text(sql_query))
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
async def process_query(data: QueryInput, db: Session = Depends(get_db)):
    try:
        user_query = data.query or data.question
        if not user_query:
            return {"sql_query": "", "results": [], "explanation": "", "error": "No query provided"}

        schema_info = get_schema_info(db)
        response_data = generate_sql(user_query, schema_info)
        sql_query = response_data["sql_query"]
        explanation = response_data["explanation"]

        results = execute_query(sql_query, db)
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
    domain_name = request.domain

    if not domain_name or domain_name not in DOMAIN_SCHEMAS:
        prompt = """
        Suggest 3 general analytical questions about a database.
        Format as JSON:
        {
            "suggestions": ["...", "...", "..."]
        }
        """
    else:
        domain_info = DOMAIN_SCHEMAS[domain_name]
        tables = ", ".join(domain_info["tables"].keys())
        kpis = ", ".join(domain_info["kpis"])
        example_queries = "\n".join([f"- {q}" for q in domain_info["system_prompt"].split("Example queries and their SQL:")[1].strip().split("\n") if q.strip().startswith(tuple(str(i) for i in range(1,10)))])

        prompt = f"""
        You are an expert data analyst. Based on the '{domain_name}' domain with tables ({tables}) and key metrics ({kpis}),
        suggest 3-5 easy, calculable analytical questions that can be answered with SQL queries.
        Consider these examples:
        {example_queries}
        Format as JSON:
        {{
            "suggestions": ["...", "...", "...", ...]
        }}
        """

    try:
        response = openai.ChatCompletion.create(
            engine="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert data analyst."},
                {"role": "user", "content": prompt}
            ]
        )
        suggestions = json.loads(response.choices[0].message.content)
        return suggestions
    except Exception as e:
        print("❌ Error generating suggestions:", e)
        return {"suggestions": ["Show me the top 5 employees by salary", "What are our most active projects?", "List recent customer feedback"]}

@api_router.post("/export")
def export_csv(request: ExportRequest):
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="No data provided")

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

@api_router.post("/synthesize_speech")
async def synthesize_speech(text_to_speak: str):
    try:
        # Create a speech synthesizer
        speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

        # Synthesize text to speech
        result = speech_synthesizer.speak_text_async(text_to_speak).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            # Get the audio data
            audio_data = result.audio_data

            # Return the audio data as a streaming response
            return StreamingResponse(
                iter([audio_data]),
                media_type="audio/wav",
                headers={"Content-Disposition": "attachment; filename=speech.wav"}
            )
        else:
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ping")
def ping():
    return {"status": "ok", "message": "pong"}

@app.get("/")
def root():
    return {"message": "Database Voice Chatbot API"}

@app.get("/schema")
def get_schema(db: Session = Depends(get_db)):
    schema_info = get_schema_info(db)
    return {"schema": schema_info}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/transcribe")
def transcribe_audio():
    return {"message": "Audio transcription endpoint"}

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_completion(messages):
    try:
        response = openai.ChatCompletion.create(
            engine="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        content = response.choices[0].message.content.strip()
        
        # Strip markdown code blocks if present
        if content.startswith("```") and content.endswith("```"):
            content = content[3:-3].strip()
            if content.startswith("json"):
                content = content[4:].strip()
        
        return content
    except Exception as e:
        print(f"❌ Error in get_completion: {e}")
        raise

# Include the API router in the main app (moved to end of file)
app.include_router(api_router)