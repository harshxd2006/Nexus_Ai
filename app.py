from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import re
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
app.config['FLASK_ENV'] = os.getenv('FLASK_ENV', 'development')

# MongoDB connection
try:
    client = MongoClient(app.config['MONGO_URI'], serverSelectionTimeoutMS=5000)
    db = client["nexusai"]
    tools_collection = db["tools"]
    reviews_collection = db["reviews"]
    client.server_info()  # Test connection
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    db = None

# Helper functions
def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

def update_tool_rating(tool_id):
    """Update the tool's average rating based on all reviews"""
    pipeline = [
        {"$match": {"tool_id": tool_id}},
        {"$group": {
            "_id": "$tool_id",
            "averageRating": {"$avg": "$rating"},
            "reviewCount": {"$sum": 1}
        }}
    ]
    
    result = list(reviews_collection.aggregate(pipeline))
    
    if result:
        avg_rating = round(result[0]['averageRating'], 1)
        tools_collection.update_one(
            {"_id": ObjectId(tool_id)},
            {"$set": {
                "rating": avg_rating,
                "reviewCount": result[0]['reviewCount']
            }}
        )

# ✅ GET all tools with search, filter, and sort
@app.route("/tools", methods=["GET"])
def get_tools():
    if not db:
        return jsonify({"error": "Database not available"}), 503

    query = {}

    # 🔍 Search
    if "search" in request.args:
        regex = re.compile(request.args["search"], re.IGNORECASE)
        query["$or"] = [
            {"name": regex},
            {"description": regex},
            {"tags": regex}
        ]

    # 🗂 Filters
    if "category" in request.args:
        query["category"] = request.args["category"]
    if "price" in request.args:
        query["price"] = request.args["price"]
    if "rating" in request.args:
        query["rating"] = {"$gte": float(request.args["rating"])}

    # 🔃 Sorting
    sort_field = request.args.get("sort", "name")
    sort_map = {
        "name": ("name", 1),
        "rating": ("rating", -1),
        "newest": ("releaseDate", -1),
        "popular": ("popularityScore", -1)
    }
    sort_key, sort_order = sort_map.get(sort_field, ("name", 1))

    try:
        tools = list(tools_collection.find(query).sort(sort_key, sort_order))
        return jsonify([serialize_doc(tool) for tool in tools])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ GET one tool by ID
@app.route("/tool/<string:tool_id>", methods=["GET"])
def get_tool(tool_id):
    if not db:
        return jsonify({"error": "Database not available"}), 503

    try:
        tool = tools_collection.find_one({"_id": ObjectId(tool_id)})
        if tool:
            return jsonify(serialize_doc(tool))
        return jsonify({"error": "Tool not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Add a tool
@app.route("/tools", methods=["POST"])
def add_tool():
    if not db:
        return jsonify({"error": "Database not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["name", "description", "category"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        data['created_at'] = datetime.utcnow()
        result = tools_collection.insert_one(data)
        return jsonify({
            "message": "Tool added successfully!",
            "id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🆕 Review Endpoints
@app.route('/tools/<string:tool_id>/reviews', methods=['GET', 'POST'])
def handle_reviews(tool_id):
    if not db:
        return jsonify({"error": "Database not available"}), 503

    try:
        # GET all reviews for a tool
        if request.method == 'GET':
            reviews = list(reviews_collection.find({"tool_id": tool_id}))
            return jsonify([serialize_doc(review) for review in reviews])

        # POST a new review
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['user_id', 'rating', 'comment']
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            # Validate rating (1-5)
            if not 1 <= int(data['rating']) <= 5:
                return jsonify({"error": "Rating must be between 1 and 5"}), 400

            # Create review document
            review = {
                'tool_id': tool_id,
                'user_id': data['user_id'],
                'rating': int(data['rating']),
                'comment': data['comment'],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            # Insert into MongoDB
            result = reviews_collection.insert_one(review)
            
            # Update tool's average rating
            update_tool_rating(tool_id)
            
            return jsonify({
                "message": "Review added successfully",
                "review_id": str(result.inserted_id)
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route("/health")
def health_check():
    if not db:
        return jsonify({"status": "unhealthy", "database": "disconnected"}), 503
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    debug = app.config['FLASK_ENV'] == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)