import json
import pandas as pd
import tensorflow as tf
import numpy as np
import time
import os


class GesturePredictor:

    LPOSE = [13, 15, 17, 19, 21]
    RPOSE = [14, 16, 18, 20, 22]
    FRAME_LEN = 128
    POSE = LPOSE + RPOSE
    REQUIRED_SIGNATURE = "serving_default"
    REQUIRED_OUTPUT = "outputs"


    def __init__(self, file_name, model_path, char_to_pred_index_path):
        self.file_name = file_name
        self.model_path = model_path
        self.char_to_pred_index_path = char_to_pred_index_path

        with open(self.file_name, 'r') as file:
            self.data = json.load(file)

        with open(self.char_to_pred_index_path, "r") as f:
            self.character_map = json.load(f)
        self.rev_character_map = {j:i for i,j in self.character_map.items()}

        self.interpreter = tf.lite.Interpreter(self.model_path)
        self.tensor_data = self.pre_process_data()

    def parse_each_frame(self, frame_index):
        try:
            overall_dic = dict()

            # frame_hand
            frame_hand = self.data['handLandmarks'][frame_index]
            # frame_pose

            frame_pose = self.data['poseLandmarks'][frame_index]

            # processing handLandmarks    
            for i in range(0, len(frame_hand['landmarks'])):
                # for each hand
                landmarks_array = frame_hand['landmarks'][i] # 21 records
                handednesses_array = frame_hand['handednesses'][i]

                for j in range(21):
                    which_hand = handednesses_array[0]['categoryName'].lower()
                    overall_dic[f"x_{which_hand}_hand_{j+1}"] = float(landmarks_array[j]['x'])
                    overall_dic[f"y_{which_hand}_hand_{j+1}"] = float(landmarks_array[j]['y'])
                    overall_dic[f"z_{which_hand}_hand_{j+1}"] = float(landmarks_array[j]['z'])

            # processing poseLandmarks:

            for p in self.POSE:
                # print(len(frame['landmarks'][0]))
                coord = frame_pose['landmarks'][0][p]
                overall_dic[f"x_pose_{p}"] = float(coord['x'])
                overall_dic[f"y_pose_{p}"] = float(coord['y'])
                overall_dic[f"z_pose_{p}"] = float(coord['z'])

            # df = pd.DataFrame([overall_dic])
            return overall_dic
        except KeyError as e:
            raise ValueError(f"Key error in `parse_each_frame()`: {e}")
        except IndexError as e:
            raise ValueError(f"Index error in parsing frame: {e}")
        except Exception as e:
            raise ValueError(f"Unexpected error in parsing frame: {e}")
    
    def resize_pad(self, x):
        if tf.shape(x)[0] < self.FRAME_LEN:
            x = tf.pad(x, ([[0, self.FRAME_LEN-tf.shape(x)[0]], [0, 0], [0, 0]]))
        else:
            x = tf.image.resize(x, (self.FRAME_LEN, tf.shape(x)[1]))
        return x

    def pre_process(self, x):

        FEATURE_COLUMNS = ['x_right_hand_0', 'x_right_hand_1', 'x_right_hand_2', 'x_right_hand_3', 'x_right_hand_4', 'x_right_hand_5', 'x_right_hand_6', 'x_right_hand_7', 'x_right_hand_8', 'x_right_hand_9', 'x_right_hand_10', 'x_right_hand_11', 'x_right_hand_12', 'x_right_hand_13', 'x_right_hand_14', 'x_right_hand_15', 'x_right_hand_16', 'x_right_hand_17', 'x_right_hand_18', 'x_right_hand_19', 'x_right_hand_20', 'x_left_hand_0', 'x_left_hand_1', 'x_left_hand_2', 'x_left_hand_3', 'x_left_hand_4', 'x_left_hand_5', 'x_left_hand_6', 'x_left_hand_7', 'x_left_hand_8', 'x_left_hand_9', 'x_left_hand_10', 'x_left_hand_11', 'x_left_hand_12', 'x_left_hand_13', 'x_left_hand_14', 'x_left_hand_15', 'x_left_hand_16', 'x_left_hand_17', 'x_left_hand_18', 'x_left_hand_19', 'x_left_hand_20', 'x_pose_13', 'x_pose_15', 'x_pose_17', 'x_pose_19', 'x_pose_21', 'x_pose_14', 'x_pose_16', 'x_pose_18', 'x_pose_20', 'x_pose_22', 'y_right_hand_0', 'y_right_hand_1', 'y_right_hand_2', 'y_right_hand_3', 'y_right_hand_4', 'y_right_hand_5', 'y_right_hand_6', 'y_right_hand_7', 'y_right_hand_8', 'y_right_hand_9', 'y_right_hand_10', 'y_right_hand_11', 'y_right_hand_12', 'y_right_hand_13', 'y_right_hand_14', 'y_right_hand_15', 'y_right_hand_16', 'y_right_hand_17', 'y_right_hand_18', 'y_right_hand_19', 'y_right_hand_20', 'y_left_hand_0', 'y_left_hand_1', 'y_left_hand_2', 'y_left_hand_3', 'y_left_hand_4', 'y_left_hand_5', 'y_left_hand_6', 'y_left_hand_7', 'y_left_hand_8', 'y_left_hand_9', 'y_left_hand_10', 'y_left_hand_11', 'y_left_hand_12', 'y_left_hand_13', 'y_left_hand_14', 'y_left_hand_15', 'y_left_hand_16', 'y_left_hand_17', 'y_left_hand_18', 'y_left_hand_19', 'y_left_hand_20', 'y_pose_13', 'y_pose_15', 'y_pose_17', 'y_pose_19', 'y_pose_21', 'y_pose_14', 'y_pose_16', 'y_pose_18', 'y_pose_20', 'y_pose_22', 'z_right_hand_0', 'z_right_hand_1', 'z_right_hand_2', 'z_right_hand_3', 'z_right_hand_4', 'z_right_hand_5', 'z_right_hand_6', 'z_right_hand_7', 'z_right_hand_8', 'z_right_hand_9', 'z_right_hand_10', 'z_right_hand_11', 'z_right_hand_12', 'z_right_hand_13', 'z_right_hand_14', 'z_right_hand_15', 'z_right_hand_16', 'z_right_hand_17', 'z_right_hand_18', 'z_right_hand_19', 'z_right_hand_20', 'z_left_hand_0', 'z_left_hand_1', 'z_left_hand_2', 'z_left_hand_3', 'z_left_hand_4', 'z_left_hand_5', 'z_left_hand_6', 'z_left_hand_7', 'z_left_hand_8', 'z_left_hand_9', 'z_left_hand_10', 'z_left_hand_11', 'z_left_hand_12', 'z_left_hand_13', 'z_left_hand_14', 'z_left_hand_15', 'z_left_hand_16', 'z_left_hand_17', 'z_left_hand_18', 'z_left_hand_19', 'z_left_hand_20', 'z_pose_13', 'z_pose_15', 'z_pose_17', 'z_pose_19', 'z_pose_21', 'z_pose_14', 'z_pose_16', 'z_pose_18', 'z_pose_20', 'z_pose_22']

        RHAND_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if "right" in col]
        LHAND_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "left" in col]
        RPOSE_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "pose" in col and int(col[-2:]) in self.RPOSE]
        LPOSE_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "pose" in col and int(col[-2:]) in self.LPOSE]

        print(f"shape of x before tf.gather: ", tf.shape(x))

        rhand = tf.gather(x, RHAND_IDX, axis=1)
        lhand = tf.gather(x, LHAND_IDX, axis=1)
        rpose = tf.gather(x, RPOSE_IDX, axis=1)
        lpose = tf.gather(x, LPOSE_IDX, axis=1)
        
        rnan_idx = tf.reduce_any(tf.math.is_nan(rhand), axis=1)
        lnan_idx = tf.reduce_any(tf.math.is_nan(lhand), axis=1)
        
        rnans = tf.math.count_nonzero(rnan_idx)
        lnans = tf.math.count_nonzero(lnan_idx)
        
        # For dominant hand
        if rnans > lnans:
            hand = lhand
            pose = lpose
            
            hand_x = hand[:, 0*(len(LHAND_IDX)//3) : 1*(len(LHAND_IDX)//3)]
            hand_y = hand[:, 1*(len(LHAND_IDX)//3) : 2*(len(LHAND_IDX)//3)]
            hand_z = hand[:, 2*(len(LHAND_IDX)//3) : 3*(len(LHAND_IDX)//3)]
            hand = tf.concat([1-hand_x, hand_y, hand_z], axis=1)
            
            pose_x = pose[:, 0*(len(LPOSE_IDX)//3) : 1*(len(LPOSE_IDX)//3)]
            pose_y = pose[:, 1*(len(LPOSE_IDX)//3) : 2*(len(LPOSE_IDX)//3)]
            pose_z = pose[:, 2*(len(LPOSE_IDX)//3) : 3*(len(LPOSE_IDX)//3)]
            pose = tf.concat([1-pose_x, pose_y, pose_z], axis=1)
        else:
            hand = rhand
            pose = rpose
        
        hand_x = hand[:, 0*(len(LHAND_IDX)//3) : 1*(len(LHAND_IDX)//3)]
        hand_y = hand[:, 1*(len(LHAND_IDX)//3) : 2*(len(LHAND_IDX)//3)]
        hand_z = hand[:, 2*(len(LHAND_IDX)//3) : 3*(len(LHAND_IDX)//3)]
        hand = tf.concat([hand_x[..., tf.newaxis], hand_y[..., tf.newaxis], hand_z[..., tf.newaxis]], axis=-1)
        
        mean = tf.math.reduce_mean(hand, axis=1)[:, tf.newaxis, :]
        std = tf.math.reduce_std(hand, axis=1)[:, tf.newaxis, :]
        hand = (hand - mean) / std

        pose_x = pose[:, 0*(len(LPOSE_IDX)//3) : 1*(len(LPOSE_IDX)//3)]
        pose_y = pose[:, 1*(len(LPOSE_IDX)//3) : 2*(len(LPOSE_IDX)//3)]
        pose_z = pose[:, 2*(len(LPOSE_IDX)//3) : 3*(len(LPOSE_IDX)//3)]
        pose = tf.concat([pose_x[..., tf.newaxis], pose_y[..., tf.newaxis], pose_z[..., tf.newaxis]], axis=-1)
        
        x = tf.concat([hand, pose], axis=1)

        print(f"Shape of x before resize x", tf.shape(x))
        x = self.resize_pad(x)
        
        x = tf.where(tf.math.is_nan(x), tf.zeros_like(x), x)
        x = tf.reshape(x, (self.FRAME_LEN, len(LHAND_IDX) + len(LPOSE_IDX)))
        return x

    def pre_process_data(self):
        try:
            num_frames = len(self.data['handLandmarks'])
            data_list = [self.parse_each_frame(i) for i in range(num_frames)]
            all_frames_df = pd.DataFrame(data_list)
            tensor_data = tf.convert_to_tensor(all_frames_df.values, dtype=tf.float32)
            return self.pre_process(tensor_data)
        except ValueError as e:
            print(f"Error processing data: {e}")
            return None
        
    def predict(self):
        try:
            prediction_fn = self.interpreter.get_signature_runner(GesturePredictor.REQUIRED_SIGNATURE)
            output = prediction_fn(inputs=self.tensor_data)
            prediction_str = "".join([self.rev_character_map.get(s, "") for s in np.argmax(output[GesturePredictor.REQUIRED_OUTPUT], axis=1)])
            return prediction_str
        except Exception as e:
            print(f"Error in prediction: {e}")
            return None
        

if __name__ == '__main__':
    script_directory = os.path.dirname(os.path.abspath(__file__))
    file_name = os.path.join(script_directory, 'data.json')
    model_path = os.path.join(script_directory, 'model.tflite')
    char_to_pred_index_path = os.path.join(script_directory, 'character_to_prediction_index.json')

    start_time = time.time()
    predictor = GesturePredictor(file_name, model_path, char_to_pred_index_path)
    prediction = predictor.predict()
    print(prediction)
    print("completed running after", time.time() - start_time)
