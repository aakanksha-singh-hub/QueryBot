# QueryBot: Conversational Data Exploration Platform

**QueryBot** is a modern **Generative AI SQL chatbot** that empowers **non-technical users** to query structured databases using natural language — via **text or voice input**. Built for simplicity, it removes the need to write SQL, making data accessible to everyone.

---

## Assumptions

- Designed for **non-technical** business users (e.g., managers, analysts)
- Uses a **pre-loaded** database securely connected via **Azure SQL**
- Only **read operations** are allowed — no data mutation
- Users can ask queries using **text input** or **microphone**
- Schema, KPIs, and domain prompts are **pre-configured**

---

## Key Features

### 1. Dashboard Explorer: Select a Data Domain

- Lets users pick a data domain to query
- Loads schema, KPIs, and domain-specific prompt context

**Examples:**
- Sales Performance
- Customer Support Tickets
- Employee Productivity

---

### 2. Smart NL-to-SQL with Domain Awareness

- Translates fuzzy natural language like:
  - “Compare sales this quarter vs last.”
  - “What’s the average salary in Marketing?”
- Injects schema/KPI context into GPT prompts for accuracy

---

### 3. Natural Language Summary of Results

- Converts SQL output into business-friendly summaries
- Adds interpretation (e.g., vs targets or previous periods)

**Example:**
> “In March, North region achieved $500K in sales, falling short by $100K from the target of $600K.”

---

### 4. Dual Input: Text and Voice

- Users can **type** or **speak** their query using a mic
- Voice input is transcribed using Azure Speech-to-Text
- Ideal for accessibility and hands-free scenarios

---

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

---

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- Azure SQL Database
- Azure OpenAI API key
- Azure Speech-to-Text key

---

### Backend Setup

1. Create a `.env` file in `backend/`:
   ```env
   DATABASE_URL="mssql+pyodbc://user:password@server.database.windows.net/database?driver=ODBC+Driver+18+for+SQL+Server"
   AZURE_OPENAI_API_KEY="your_openai_key"
   AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   AZURE_SPEECH_KEY="your_speech_key"
   AZURE_SPEECH_REGION="your_region"



### Frontend Setup

1.  Navigate to frontend folder:
  
    `cd frontend` 
    
2.  Install dependencies:
    
    `npm install` 
    
3.  Start the frontend:
    
    `npm start` 
    

----------

## How to Use

1.  Open your browser and go to:  
    [http://localhost:3000](http://localhost:3000)
    
2.  Select a data domain from the **Dashboard Explorer**
    
3.  Go to the **Chat** tab
    
4.  Type your question **or click 🎙️ to speak** it
    
5.  View:
    
    -   The generated SQL query
        
    -   Tabular results
        
    -   Natural language summary
        
6.  Download results as:
    
    -   CSV
        
    -   Excel
        
    -   JSON
        

----------

## Sample Queries

| Natural Language Input                  | SQL Translation                                                                                   |
|-----------------------------------------|---------------------------------------------------------------------------------------------------|
| List all departments                    | `SELECT DISTINCT department FROM employees;`                                                      |
| Top 5 products by sales in 2023         | `SELECT TOP 5 product_name, SUM(sales) FROM orders WHERE YEAR(order_date) = 2023 GROUP BY product_name ORDER BY SUM(sales) DESC;` |
| Average salary by department            | `SELECT department, AVG(salary) FROM employees GROUP BY department;`                              |
| Show total revenue per year             | `SELECT YEAR(order_date), SUM(revenue) FROM sales GROUP BY YEAR(order_date);`                     |

----------

## Prompting Tips

-   Be specific: Use filters and known fields
    
-   Use keywords like “compare”, “trend”, “highest”
    
-   Avoid vague queries like “Show me insights”
    

----------

## Known Limitations

-   Only supports **read** operations — no writes/updates
    
-   May struggle with **vague** or **ambiguous** input
    
-   Sensitive data masking is not implemented
    
-   Schema changes require backend reload
    

----------

## Reflections

See [`REFLECTIONS.txt`](./REFLECTIONS.txt) for detailed insights.

> GPT-4 performs reliably when grounded with schema + KPI context. Voice input makes the tool more inclusive, while summaries make it understandable for business users.

----------

## License

MIT License

----------

## Acknowledgments

-   [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai/)
    
-   [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/)
    
-   [Azure Speech Services](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
    
-   React & Material UI community
