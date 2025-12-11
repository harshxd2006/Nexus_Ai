from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["nexusai"]
collection = db["tools"]

with open("tools.json", encoding="utf-8") as f:
    tools_by_category = json.load(f)

all_tools = []
for category, tools in tools_by_category.items():
    for tool in tools:
        tool["category"] = category  # Add category field
        all_tools.append(tool)

collection.insert_many(all_tools)
print(f"Inserted {len(all_tools)} tools into MongoDB.")
