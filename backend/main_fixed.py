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
    response = openai.ChatCompletion.create(
        engine="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert SQL assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    message = response.choices[0].message.content
    print("🧠 RAW OPENAI MESSAGE:", message)
    
    parsed = json.loads(message)
    print("🔍 PARSED:", parsed)
    print("TYPE:", type(parsed))

    return {
        "sql_query": parsed.get("sql_query", "").strip(),
        "explanation": parsed.get("explanation", "").strip()
    }

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