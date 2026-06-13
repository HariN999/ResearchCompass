#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

print("=" * 60)
print("Azure Foundry Test")
print("=" * 60)

try:
    endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]
    api_key = os.environ["AZURE_OPENAI_API_KEY"]
    deployment = os.environ["AZURE_OPENAI_DEPLOYMENT"]

    print(f"Endpoint: {endpoint}")
    print(f"Deployment: {deployment}")

    client = OpenAI(
        base_url=endpoint,
        api_key=api_key,
    )

    print("\nSending test request...\n")

    response = client.chat.completions.create(
        model=deployment,
        messages=[
            {
                "role": "user",
                "content": "Reply with exactly: OK"
            }
        ]
    )

    print("SUCCESS")
    print("-" * 60)
    print(response.choices[0].message.content)
    print("-" * 60)

except Exception as e:
    print("\nFAILED\n")
    print(type(e).__name__)
    print(e)