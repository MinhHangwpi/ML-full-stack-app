from flask import Flask, request, jsonify
import json
import os
import time
from transformation import GesturePredictor

app = Flask(__name__)

@app.route('/endpoint', methods=['POST'])
def receive_data():
    try:
        data = request.json

        # Save the data to a JSON file
        script_directory = os.path.dirname(os.path.abspath(__file__))
        file_name = os.path.join(script_directory, 'data.json')
        with open(file_name, 'w') as file:
            json.dump(data, file, indent=4)

        # Processing the data and return the result
        model_path = os.path.join(script_directory, 'model.tflite')
        char_to_pred_index_path = os.path.join(script_directory, 'character_to_prediction_index.json')

        start_time = time.time()
        predictor = GesturePredictor(file_name, model_path, char_to_pred_index_path)
        prediction = predictor.predict()
        print("Prediction completed in", time.time() - start_time, "seconds")

        return jsonify({"message": f"The predicted phrase is {prediction}"})

    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
