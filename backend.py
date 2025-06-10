from fastapi import FastAPI, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import pandas as pd
from io import StringIO
import json
from db_chatbot import DatabaseChatbot
import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
import tempfile

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize DatabaseChatbot
chatbot = DatabaseChatbot(
    connection_string=os.getenv('AZURE_SQL_CONNECTION_STRING'),
    api_key=os.getenv('AZURE_OPENAI_API_KEY'),
    api_version=os.getenv('AZURE_OPENAI_VERSION', '2024-02-15-preview'),
    deployment_name=os.getenv('AZURE_OPENAI_DEPLOYMENT'),
    endpoint=os.getenv('AZURE_OPENAI_ENDPOINT')
)

# Initialize Speech SDK
speech_config = speechsdk.SpeechConfig(
    subscription=os.getenv('AZURE_SPEECH_KEY'),
    region=os.getenv('AZURE_SPEECH_REGION')
)
speech_config.speech_recognition_language = "en-US"

class QueryRequest(BaseModel):
    query: str

@app.get("/schema")
async def get_schema():
    """Get database schema information."""
    try:
        schema_info = chatbot.get_schema_info()
        return {"schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def process_query(request: QueryRequest):
    """Process a natural language query."""
    try:
        # Special handling for "low-stock" query
        if "low-stock" in request.query.lower():
            sql_query = """
            BEGIN TRY
                SELECT DISTINCT 
                    p.project_name,
                    p.status,
                    p.budget,
                    p.client_name,
                    s.payment_status,
                    s.amount as pending_amount
                FROM projects p
                LEFT JOIN sales s ON p.project_id = s.project_id
                WHERE p.status = 'In Progress'
                AND s.payment_status = 'Pending'
                ORDER BY s.amount DESC
            END TRY
            BEGIN CATCH
                SELECT ERROR_NUMBER() AS ErrorNumber, ERROR_MESSAGE() AS ErrorMessage;
            END CATCH
            """
        else:
            # Generate SQL query for other queries
            sql_query = chatbot.generate_sql_query(request.query)
        
        # Execute query
        results_df = chatbot.execute_query(sql_query)
        
        # Convert results to dict for JSON response
        results = results_df.to_dict(orient='records')
        
        # Get analysis
        analysis = chatbot.analyze_data(results_df)
        
        # Get suggestions based on the current context
        suggestions = chatbot.get_suggested_queries()
        
        return {
            "sql": sql_query,
            "results": results,
            "analysis": analysis,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export")
async def export_data(format: str):
    """Export the last query results in the specified format."""
    try:
        # Get the last query results from the chatbot's memory
        last_results = None
        for msg in reversed(chatbot.chat_memory.get_context()):
            if msg.get('metadata', {}).get('type') == 'results':
                last_results = msg['metadata']['data']
                break
        
        if not last_results:
            raise HTTPException(status_code=404, detail="No query results available for export")
        
        # Convert to DataFrame
        df = pd.DataFrame(last_results)
        
        # Export based on format
        if format == 'csv':
            output = StringIO()
            df.to_csv(output, index=False)
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=query-results.csv",
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
        elif format == 'json':
            return Response(
                content=df.to_json(orient='records'),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=query-results.json",
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
        elif format == 'excel':
            output = StringIO()
            df.to_excel(output, index=False)
            return Response(
                content=output.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f"attachment; filename=query-results.xlsx",
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """Transcribe audio file to text using Azure Speech SDK."""
    try:
        # Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Create audio config from the temporary file
            audio_config = speechsdk.audio.AudioConfig(filename=temp_file.name)
            
            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            
            # Start recognition
            result = speech_recognizer.recognize_once_async().get()
            
            # Clean up the temporary file
            os.unlink(temp_file.name)
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return {"text": result.text}
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Speech recognition failed: {result.error_details}"
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 