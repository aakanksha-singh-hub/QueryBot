<h1 align="center"><span><img height=30px src="https://github.com/user-attachments/assets/98c0aaba-897e-4d17-a032-90b94420c016"> QueryBot </h1>
  
**QueryBot** is a modern **Generative AI SQL chatbot** that empowers **non-technical users** to query structured databases using natural language — via **text or voice input**. Built for simplicity, it removes the need to write SQL, making data accessible to everyone.

## 📽️ Demo Video

[![Watch the demo](https://img.youtube.com/vi/zXYcH47k2g8/0.jpg)](https://youtu.be/zXYcH47k2g8)


## Assumptions

- Designed for **non-technical** business users (e.g., managers, analysts)
- Uses a **pre-loaded** database securely connected via **Azure SQL**
- Only **read operations** are allowed — no data mutation
- Users can ask queries using **text input** or **microphone**
- Schema, KPIs, and domain prompts are **pre-configured**

## Key Features

### 1. Dashboard Explorer: Select a Data Domain

- Lets users pick a data domain to query
- Loads schema, KPIs, and domain-specific prompt context

**Examples:**
- Sales Performance
- Customer Support Tickets
- Employee Productivity

### 2. Smart NL-to-SQL with Domain Awareness

- Translates fuzzy natural language like:
  - “Compare sales this quarter vs last.”
  - “What’s the average salary in Marketing?”
- Injects schema/KPI context into GPT prompts for accuracy

### 3. Natural Language Summary of Results

- Converts SQL output into business-friendly summaries
- Adds interpretation (e.g., vs targets or previous periods)

**Example:**
> “In March, North region achieved $500K in sales, falling short by $100K from the target of $600K.”

### 4. Dual Input: Text and Voice

- Users can **type** or **speak** their query using a mic
- Voice input is transcribed using Azure Speech-to-Text
- Ideal for accessibility and hands-free scenarios

## Tech Stack

| Layer      | Technology/Library         | Purpose                                 |
|------------|----------------------------|------------------------------------------|
| Frontend   | React                      | UI framework                             |
|            | Material UI (MUI)          | Components, theming, icons               |
|            | React Router               | Routing/navigation                       |
|            | Chart.js, Recharts         | Visualizations                           |
| Backend    | FastAPI                    | REST API framework                       |
|            | SQLAlchemy                 | ORM + Azure SQL integration              |
|            | Pandas                     | Data transformation                      |
|            | Azure OpenAI (GPT-4)       | SQL generation + summarization           |
|            | Azure Speech-to-Text       | Voice input transcription                |
| DevOps     | Docker, dotenv             | Containerization, config management      |
| Security   | CORS, Azure Identity       | API access + environment security        |

## Setup Instructions

### Backend
1. Create a `.env` file with your Azure SQL, OpenAI, and Speech Service credentials. Example:
   ```
   DATABASE_URL="mssql+pyodbc://user:password@server.database.windows.net/database?driver=ODBC+Driver+18+for+SQL+Server"
   AZURE_OPENAI_API_KEY="your_azure_openai_api_key"
   AZURE_OPENAI_ENDPOINT="https://your-openai-resource.openai.azure.com/"
   AZURE_SPEECH_KEY="your_azure_speech_key"
   AZURE_SPEECH_REGION="your_azure_speech_region"
   ```
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Start the backend:
   ```bash
   uvicorn backend.main:app --reload
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```

## How to Use

1.  Open your browser and go to:  [http://localhost:3000](http://localhost:3000)
    
2.  Select a data domain from the `Dashboard Explorer`
    
3.  Go to the `Chat` tab
    
4.  Type your question or click 🎙️ to speak it
    
5.  View:
    -   The generated SQL query
    -   Tabular results
    -   Natural language summary
        
6.  Download results as `xlsx`

## Sample Queries

| Natural Language Input                  | SQL Translation                                                                                   |
|-----------------------------------------|---------------------------------------------------------------------------------------------------|
| List all departments                    | `SELECT DISTINCT department FROM employees;`                                                      |
| Top 5 products by sales in 2023         | `SELECT TOP 5 product_name, SUM(sales) FROM orders WHERE YEAR(order_date) = 2023 GROUP BY product_name ORDER BY SUM(sales) DESC;` |
| Average salary by department            | `SELECT department, AVG(salary) FROM employees GROUP BY department;`                              |
| Show total revenue per year             | `SELECT YEAR(order_date), SUM(revenue) FROM sales GROUP BY YEAR(order_date);`                     |


## Prompting Tips

-   Be specific: Use filters and known fields
    
-   Use keywords like “compare”, “trend”, “highest”
    
-   Avoid vague queries like “Show me insights”
    

## Known Limitations

-   Only supports **read** operations — no writes/updates
    
-   May struggle with **vague** or **ambiguous** input
    
-   Sensitive data masking is not implemented
    
-   Schema changes require backend reload

## Reflections

See [`REFLECTIONS.txt`](./REFLECTIONS.txt) for detailed insights.

## Acknowledgments

> GPT-4 performs reliably when grounded with schema + KPI context. Voice input makes the tool more inclusive, while summaries make it understandable for business users.

-   [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai/)
-   [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/)
-   [Azure Speech Services](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
-   React & Material UI community
