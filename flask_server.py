from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import os

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_NAME = os.getenv('MODEL_NAME', "facebook/opt-350m")
PORT = int(os.getenv('PORT', 5000))

# Load model
try:
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)
except Exception as e:
    print(f"Model loading error: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/query', methods=['POST'])
def query_model():
    """Handle chat requests from frontend without WebSockets."""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
        
    data = request.json
    user_input = data.get('question', '').strip()

    if not user_input:
        return jsonify({'error': 'No question provided'}), 400

    try:
        response = pipe(user_input, max_length=150, do_sample=True)[0]['generated_text']
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
