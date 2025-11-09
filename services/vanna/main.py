from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from groq import Groq
import psycopg2
from psycopg2.extras import RealDictCursor
import json

load_dotenv()

app = FastAPI(title="Vanna AI Chat Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client (lazy initialization to avoid errors if API key is missing)
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("Warning: GROQ_API_KEY not set. Chat functionality will not work.")
    groq_client = None
else:
    try:
        groq_client = Groq(api_key=groq_api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize Groq client: {e}")
        groq_client = None

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Get PostgreSQL connection"""
    # Convert postgresql+psycopg:// to postgresql:// if needed
    # Note: Password should be URL-encoded in DATABASE_URL (e.g., @ becomes %40)
    db_url = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")
    return psycopg2.connect(db_url)

def execute_sql(sql: str):
    """Execute SQL query and return results"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql)
        results = cursor.fetchall()
        # Convert to list of dicts
        return [dict(row) for row in results]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL execution error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

def get_schema_info():
    """Get database schema information for context"""
    schema_query = """
    SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
    """
    try:
        return execute_sql(schema_query)
    except Exception as e:
        # If schema query fails, return empty list
        print(f"Warning: Could not fetch schema info: {e}")
        return []

def generate_sql_with_groq(natural_language_query: str) -> str:
    """Use Groq to generate SQL from natural language"""
    
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    # Get schema information
    schema_info = get_schema_info()
    
    # Build schema context
    schema_context = "Database Schema:\n"
    current_table = None
    for col in schema_info:
        if col['table_name'] != current_table:
            if current_table:
                schema_context += "\n"
            current_table = col['table_name']
            schema_context += f"Table: {current_table}\n"
        schema_context += f"  - {col['column_name']} ({col['data_type']})\n"
    
    # Sample queries for context
    examples = """
Example queries:
- "What's the total spend in the last 90 days?" -> SELECT SUM(total) FROM invoices WHERE issue_date >= CURRENT_DATE - INTERVAL '90 days';
- "List top 5 vendors by spend" -> SELECT v.name, SUM(i.total) as total_spend FROM invoices i JOIN vendors v ON i.vendor_id = v.id GROUP BY v.id, v.name ORDER BY total_spend DESC LIMIT 5;
- "Show overdue invoices" -> SELECT * FROM invoices WHERE status = 'OVERDUE' OR (status = 'PENDING' AND due_date < CURRENT_DATE);
"""
    
    prompt = f"""You are a SQL expert. Given a database schema and a natural language query, generate a PostgreSQL SQL query.

{schema_context}

{examples}

Natural language query: {natural_language_query}

Generate ONLY the SQL query, no explanations, no markdown formatting, just the SQL statement:"""

    try:
        # Use a supported model
        # Updated: llama-3.1-70b-versatile was decommissioned
        # Default to llama-3.1-8b-instant (commonly available, fast)
        # Can be overridden with GROQ_MODEL environment variable
        model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        
        response = groq_client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate PostgreSQL queries only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Clean up SQL (remove markdown code blocks if present)
        if sql.startswith("```sql"):
            sql = sql[6:]
        if sql.startswith("```"):
            sql = sql[3:]
        if sql.endswith("```"):
            sql = sql[:-3]
        sql = sql.strip()
        
        return sql
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    sql: str
    data: list
    chart: Optional[dict] = None

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process natural language query and return SQL + results"""
    try:
        # Generate SQL using Groq
        sql = generate_sql_with_groq(request.query)
        
        # Execute SQL
        results = execute_sql(sql)
        
        # Determine if we should suggest a chart
        # Always generate a chart if there's data (up to 100 rows)
        chart = None
        if len(results) > 0 and len(results) <= 100:
            first_row = results[0]
            all_keys = list(first_row.keys())
            
            # Helper function to check if a value is numeric (including string numbers)
            def is_numeric(value):
                if isinstance(value, (int, float)):
                    return True
                if isinstance(value, str):
                    try:
                        float(value.replace(',', ''))
                        return True
                    except (ValueError, AttributeError):
                        return False
                return False
            
            # Find numeric columns (including string numbers from database)
            numeric_keys = []
            for k, v in first_row.items():
                if is_numeric(v) and v is not None:
                    numeric_keys.append(k)
            
            # Find text/category columns (potential x-axis)
            text_keys = [k for k, v in first_row.items() if isinstance(v, str) and len(str(v)) < 50 and not is_numeric(v)]
            date_keys = [k for k, v in first_row.items() if isinstance(v, str) and ('date' in k.lower() or 'time' in k.lower())]
            
            # Determine chart type and configuration
            if numeric_keys:
                # Choose x-axis: prefer dates, then text, then first column
                x_key = None
                if date_keys:
                    x_key = date_keys[0]
                elif text_keys:
                    x_key = text_keys[0]
                elif len(all_keys) > 1:
                    x_key = [k for k in all_keys if k not in numeric_keys][0] if len([k for k in all_keys if k not in numeric_keys]) > 0 else all_keys[0]
                else:
                    x_key = all_keys[0] if all_keys else None
                
                # Choose y-axis: prefer sum/total/count columns, then first numeric
                y_key = None
                priority_keys = [k for k in numeric_keys if any(word in k.lower() for word in ['total', 'sum', 'count', 'amount', 'value', 'spend', 'cost'])]
                if priority_keys:
                    y_key = priority_keys[0]
                else:
                    y_key = numeric_keys[0]
                
                # Determine chart type based on data
                if len(results) == 1:
                    # Single value - show as card/metric
                    chart = {
                        "type": "metric",
                        "config": {
                            "value": y_key,
                            "label": x_key if x_key else "Value"
                        }
                    }
                elif len(results) <= 20:
                    # Small dataset - bar chart
                    chart = {
                        "type": "bar",
                        "config": {
                            "x": x_key,
                            "y": y_key,
                            "dataKey": y_key
                        }
                    }
                elif date_keys and len(results) > 1:
                    # Time series - line chart
                    chart = {
                        "type": "line",
                        "config": {
                            "x": date_keys[0],
                            "y": y_key,
                            "dataKey": y_key
                        }
                    }
                elif len(numeric_keys) > 1:
                    # Multiple numeric columns - bar chart with multiple series
                    chart = {
                        "type": "bar",
                        "config": {
                            "x": x_key,
                            "y": numeric_keys[:3],  # Limit to 3 series for readability
                            "dataKey": numeric_keys[0]
                        }
                    }
                elif text_keys and len(results) <= 10:
                    # Small dataset with text categories - pie chart
                    chart = {
                        "type": "pie",
                        "config": {
                            "x": text_keys[0],
                            "y": y_key,
                            "dataKey": y_key
                        }
                    }
                else:
                    # Default - bar chart
                    chart = {
                        "type": "bar",
                        "config": {
                            "x": x_key,
                            "y": y_key,
                            "dataKey": y_key
                        }
                    }
            elif len(all_keys) >= 2 and len(results) > 0:
                # Even without numeric columns, try to create a chart with the first two columns
                # This handles cases where data might be categorical
                x_key = all_keys[0]
                y_key = all_keys[1] if len(all_keys) > 1 else None
                
                if y_key:
                    # Try to use the second column as a count or create a simple bar chart
                    chart = {
                        "type": "bar",
                        "config": {
                            "x": x_key,
                            "y": y_key,
                            "dataKey": y_key
                        }
                    }
            
            # Log chart generation for debugging
            print(f"📊 Chart generation: has_data={len(results) > 0}, numeric_keys={len(numeric_keys) if numeric_keys else 0}, chart={chart is not None}, chart_type={chart.get('type') if chart else None}")
        
        # Final fallback: if we have data but no chart, create a simple bar chart
        if chart is None and len(results) > 0 and len(results) <= 100:
            first_row = results[0]
            all_keys = list(first_row.keys())
            if len(all_keys) >= 2:
                chart = {
                    "type": "bar",
                    "config": {
                        "x": all_keys[0],
                        "y": all_keys[1],
                        "dataKey": all_keys[1]
                    }
                }
                print(f"📊 Fallback chart generated: x={all_keys[0]}, y={all_keys[1]}")
        
        return ChatResponse(
            sql=sql,
            data=results,
            chart=chart
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))

