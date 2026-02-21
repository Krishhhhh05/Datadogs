import asyncio
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from core.orchestrator import ProductLaunchOrchestrator, LEARNING_LOG_PATH

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

USERS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "users.json")
orchestrator = ProductLaunchOrchestrator()

@app.route('/auth/login', methods=['POST'])
def login():
    """Authenticate user against data/users.json."""
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    try:
        with open(USERS_PATH, "r") as f:
            users = json.load(f)
    except Exception:
        return jsonify({"success": False, "error": "User database not found"}), 500

    for user in users:
        if user["username"] == username and user["password"] == password:
            return jsonify({
                "success": True,
                "user": {"username": user["username"], "name": user["name"], "role": user["role"]}
            })

    return jsonify({"success": False, "error": "Invalid username or password"}), 401

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    product_idea = data.get('product_idea')
    
    if not product_idea:
        return jsonify({"error": "No product idea provided"}), 400
    
    # Run the orchestrator simulation
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        results = loop.run_until_complete(orchestrator.run_simulation(product_idea))
        return jsonify(results)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        loop.close()

@app.route('/learning', methods=['GET'])
def learning():
    """Return the full learning log for the frontend tracking panel."""
    if not os.path.exists(LEARNING_LOG_PATH):
        return jsonify([])
    try:
        with open(LEARNING_LOG_PATH, "r") as f:
            log = json.load(f)
        return jsonify(log)
    except Exception:
        return jsonify([])

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    context = data.get('context')
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
        
    try:
        response = orchestrator.master_agent.chat(message, context)
        return jsonify(response)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
