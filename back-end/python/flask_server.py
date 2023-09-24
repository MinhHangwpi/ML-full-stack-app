from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/endpoint', methods=['POST'])
def receive_data():
    data = request.json
    print("Received data:", data)

    # Process the data if needed (omitted here for simplicity)

     # Save the data to a JSON file
    with open('received_data.json', 'w') as file:
        json.dump(data, file, indent=4)  # The 'indent=4' argument pretty-prints the JSON


    return jsonify({"message": "Data received and processed by Flask!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Change the port if needed
