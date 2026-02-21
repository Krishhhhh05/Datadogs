import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from core.orchestrator import ProductLaunchOrchestrator

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

orchestrator = ProductLaunchOrchestrator()

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
