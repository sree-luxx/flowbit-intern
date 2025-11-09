#!/usr/bin/env python3
"""Quick script to check if environment variables are loaded correctly"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("=" * 50)
print("Environment Variable Check")
print("=" * 50)
print()

# Check GROQ_API_KEY
groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    # Show first and last 4 characters for security
    masked_key = f"{groq_key[:4]}...{groq_key[-4:]}" if len(groq_key) > 8 else "***"
    print(f"✅ GROQ_API_KEY: {masked_key} (length: {len(groq_key)})")
else:
    print("❌ GROQ_API_KEY: NOT SET")

# Check DATABASE_URL
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Mask password in URL
    if "@" in db_url:
        parts = db_url.split("@")
        if "://" in parts[0]:
            user_pass = parts[0].split("://")[1]
            if ":" in user_pass:
                user = user_pass.split(":")[0]
                masked_url = db_url.replace(user_pass, f"{user}:***")
                print(f"✅ DATABASE_URL: {masked_url}")
            else:
                print(f"✅ DATABASE_URL: {db_url}")
        else:
            print(f"✅ DATABASE_URL: {db_url}")
    else:
        print(f"✅ DATABASE_URL: {db_url}")
else:
    print("❌ DATABASE_URL: NOT SET")

# Check PORT
port = os.getenv("PORT", "8000")
print(f"✅ PORT: {port}")

print()
print("=" * 50)

# Test Groq client initialization
if groq_key:
    try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        print("✅ Groq client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Groq client: {e}")
else:
    print("⚠️  Cannot test Groq client - API key not set")

print("=" * 50)
