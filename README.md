# QueryBot

A modern, production-ready GenAI SQL chatbot platform that enables users to query structured databases using natural language. QueryBot removes the technical barrier of writing SQL and allows anyone to interact with data conversationally and securely.

---

## ✨ Key Features of the Voice-Enabled Data Interpreter Assistant

### 📂 1. Dashboard Explorer: Select a Data Domain
Let users choose the type of data they want to explore, so the assistant understands the context and tailors responses accurately.
**What it does:**
- Presents predefined domains like:
    - 📊 Sales Performance
    - 🎟️ Customer Support Tickets
    - 👥 Employee Productivity
- Automatically loads:
    - Schema (table/field names)
    - KPI definitions
    - Domain-specific prompt templates

### 🧠 2. Domain-Aware Query Handling (Smart Prompting + SQL Generation)
Allow natural language queries like:
"How did North region perform in March?"
"Compare this quarter with the previous one."
**What it does:**
- Translates user query into SQL using GPT
- Handles fuzzy, human-like questions
- Injects schema and KPI context into GPT prompts

### 🧾 3. Natural Language Summary of Raw Data
Go beyond SQL rows — explain results in plain English for business users.
**What it does:**
- Converts query results into a concise explanation
- Adds comparison logic (e.g., vs target, vs last period)
**Example output:**
"In March, North region achieved $500K in sales, falling short by $100K from the target of $600K."

### 🗣️ 4. Voice Output (Text-to-Speech)
Let the assistant speak the final answer aloud.
**What it does:**
- Converts text summary into spoken response
- Enhances accessibility and user experience
- Provides a "🔊 Speak Answer" button that plays the spoken version of the response.
- Optionally, auto-reads the answer after summarization or successful query execution.

---

## Tech Stack

| Layer      | Technology/Library         | Purpose                                 |
|------------|---------------------------|-----------------------------------------|
| Frontend   | React                     | UI framework                            |
|            | Material UI (MUI)         | UI components, theming, icons           |
|            | React Router              | Routing/navigation                      |
|            | Chart.js, Recharts        | Data visualizations                     |
|            | Custom CSS                | Additional styling                      |
| Backend    | FastAPI                   | REST API framework                      |
|            | SQLAlchemy                | Database connection/ORM                 |
|            | Pandas                    | Data manipulation                       |
|            | Azure OpenAI (GPT-4)      | NL-to-SQL translation, Summarization, Prompting |
|            | Azure SQL Database        | Data storage                            |
|            | Azure Speech Service      | Text-to-Speech capabilities             |
|            | Uvicorn                   | ASGI server                             |
| DevOps     | Docker                    | Containerization                        |
|            | dotenv                    | Env variable management                 |
|            | CORS Middleware           | Secure API access                       |

---

## Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Azure SQL Database
- Azure OpenAI Service
- Azure Speech Service

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

---

## Usage

1. Go to `http://localhost:3000`
2. Select a data domain using the **Dashboard Explorer**.
3. Go to **Chat** and ask questions in natural language.
4. View results in a table and as visualizations, along with a **Natural Language Summary**.
5. Click the **🔊 Speak Answer** button next to assistant responses to hear them read aloud.
6. Export results as CSV, Excel, or JSON.

---

## Sample Queries

| Natural Language Input                  | SQL Translation                                                                                   |
|-----------------------------------------|---------------------------------------------------------------------------------------------------|
| List all departments                    | `SELECT DISTINCT department FROM employees;`                                                      |
| Top 5 products by sales in 2023         | `SELECT TOP 5 product_name, SUM(sales) FROM orders WHERE YEAR(order_date) = 2023 GROUP BY product_name ORDER BY SUM(sales) DESC;` |
| Average salary by department            | `SELECT department, AVG(salary) FROM employees GROUP BY department;`                              |
| Show total revenue per year             | `SELECT YEAR(order_date), SUM(revenue) FROM sales GROUP BY YEAR(order_date);`                     |

---

## Prompting Tips

- **Be specific:** Include table or column names when possible.
- **Use filters:** e.g., "Employees with salary over 70000 in Marketing."
- **Avoid vague phrasing:** General inputs like "Show me something interesting" may not yield usable results.

---

## Limitations

- May struggle with vague or highly contextual queries.
- Only read operations are permitted (no updates/deletes).
- SQL errors are caught and shown gracefully, but complex queries may require refinement.
- Sensitive data masking is not yet implemented.

---

## Reflections

See [REFLECTIONS.txt](./REFLECTIONS.txt) for a detailed write-up.

**Summary:**
- GenAI (GPT-4) can accurately translate natural language to SQL, especially when grounded with schema and context.
- Prompt engineering and schema-awareness are essential for reliable results.
- Robust error handling and a clean UI are key for user trust and adoption.

---

## License

MIT License

---

## Acknowledgments

- Azure OpenAI Service
- Azure SQL Database
- Azure Speech Service
- Python Data Science Stack (pandas, numpy)
- Material UI & React Community 