@app.route("/api/reviews/<tool>", methods=["GET"])
def get_reviews(tool):
    reviews = list(reviews_collection.find({"tool": tool}))
    for r in reviews:
        r["_id"] = str(r["_id"])
        r["date"] = r["date"]
    return jsonify(reviews)