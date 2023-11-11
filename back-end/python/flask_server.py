from flask import Flask, request, jsonify
import json
import os
import time
from transformation import GesturePredictor

app = Flask(__name__)

@app.route('/endpoint', methods=['POST'])
def receive_data():
    data = request.json
    # print("Received data:", data)
     # Save the data to a JSON file
    
    script_directory = os.path.dirname(os.path.abspath(__file__))
    file_name = os.path.join(script_directory, 'data.json')
    with open(file_name, 'w') as file:
        json.dump(data, file, indent=4) 

    # processing the data and return the result
    
    model_path = os.path.join(script_directory, 'model.tflite')
    char_to_pred_index_path = os.path.join(script_directory, 'character_to_prediction_index.json')

    start_time = time.time()
    predictor = GesturePredictor(file_name, model_path, char_to_pred_index_path)
    prediction = predictor.predict()
    print("completed running after", time.time() - start_time)

    # Delete the data.json file
    # if os.path.exists(file_name):
    #     os.remove(file_name)

    return jsonify({"message": f"The predicted phrase is {prediction}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Change the port if needed
