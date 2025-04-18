from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

@app.route("/query", methods=["POST"])
def query():
    data = request.get_json()
    message = data.get("question")

    try:
        # Forward message to your AWS RAG backend
        response = requests.post(
            "http://54.91.105.145:8000/ask",
            json={"question": message}
        )
        response.raise_for_status()
        rag_response = response.json()

        return jsonify({"response": rag_response.get("answer", "No answer returned.")})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5000)
