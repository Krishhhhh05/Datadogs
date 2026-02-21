import asyncio
import json
import os
import certifi
import ssl
import websockets
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sock import Sock
from core.orchestrator import ProductLaunchOrchestrator, LEARNING_LOG_PATH

app = Flask(__name__)
sock = Sock(app)
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

@app.route('/auth/register', methods=['POST'])
def register():
    """Register a new user and save to data/users.json."""
    data = request.json or {}
    name = data.get('name', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not name or not username or not password:
        return jsonify({"success": False, "error": "All fields are required"}), 400
    if len(password) < 4:
        return jsonify({"success": False, "error": "Password must be at least 4 characters"}), 400

    # Load existing users
    users = []
    if os.path.exists(USERS_PATH):
        try:
            with open(USERS_PATH, "r") as f:
                users = json.load(f)
        except Exception:
            pass

    # Check duplicate
    if any(u["username"] == username for u in users):
        return jsonify({"success": False, "error": "Username already taken"}), 409

    # Add new user
    users.append({"username": username, "password": password, "name": name, "role": "analyst"})

    # Ensure data dir exists
    os.makedirs(os.path.dirname(USERS_PATH), exist_ok=True)
    with open(USERS_PATH, "w") as f:
        json.dump(users, f, indent=2)

    return jsonify({"success": True})

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

@sock.route('/ws/stt')
def stt_socket(ws):
    """
    WebSocket proxy for Modulate Velma API.
    Receives binary audio from the frontend and forwards it to Modulate.
    Receives JSON utterances from Modulate and forwards to the frontend.
    """
    import threading

    api_key = os.getenv("MODULATE_API_KEY")
    if not api_key:
        ws.send(json.dumps({"type": "error", "error": "Modulate API key missing on server"}))
        return

    modulate_url = f"wss://modulate-prototype-apis.com/api/velma-2-stt-streaming?api_key={api_key}"
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    def proxy_audio_to_modulate(client_ws, modulate_ws):
        """Reads from frontend (browser) and writes to Modulate."""
        try:
            while True:
                data = client_ws.receive()
                if data is None:
                    break
                # Forward binary data directly or close text signal
                if isinstance(data, str) and data == "":
                    # Empty string signals end of stream
                    asyncio.run(modulate_ws.send(""))
                    break
                else:
                    asyncio.run(modulate_ws.send(data))
        except Exception as e:
            print(f"Error reading from client / sending to modulate: {e}")

    async def run_modulate_connection():
        try:
            async with websockets.connect(modulate_url, ssl=ssl_context) as modulate_ws:
                # Start a separate thread to read from client and push to Modulate
                # using the synchronous Flask-Sock API
                upload_thread = threading.Thread(
                    target=proxy_audio_to_modulate,
                    args=(ws, modulate_ws),
                    daemon=True
                )
                upload_thread.start()

                # Read JSON utterances from Modulate and push to client
                try:
                    async for message in modulate_ws:
                        ws.send(message)
                        msg_data = json.loads(message)
                        if msg_data.get("type") == "done":
                            break
                except websockets.exceptions.ConnectionClosed:
                    pass
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            try:
                ws.send(json.dumps({"type": "error", "error": f"Modulate Connection failed: {str(e)}"}))
            except:
                pass

    # Run the async loop inside the sync Flask-Sock route
    asyncio.run(run_modulate_connection())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
