import json
import pandas as pd
import tensorflow as tf
import numpy as np
import time

file_name = "data.json"

start_time = time.time()
# defining the POSE indexes that we care about
LPOSE = [13, 15, 17, 19, 21]
RPOSE = [14, 16, 18, 20, 22]
FRAME_LEN = 128

POSE = LPOSE + RPOSE



with open(file_name, 'r') as file:
    data = json.load(file)

# function to process each frame:

def parse_each_frame(data, frame_index):

    overall_dic = dict()

    # frame_hand
    frame_hand = data['handLandmarks'][frame_index]
    # frame_pose

    frame_pose = data['poseLandmarks'][frame_index]

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

    for p in POSE:
        # print(len(frame['landmarks'][0]))
        coord = frame_pose['landmarks'][0][p]
        overall_dic[f"x_pose_{p}"] = float(coord['x'])
        overall_dic[f"y_pose_{p}"] = float(coord['y'])
        overall_dic[f"z_pose_{p}"] = float(coord['z'])

    # df = pd.DataFrame([overall_dic])
    return overall_dic


# Parse data and collect results in a list
data_list = [parse_each_frame(data, i) for i in range(FRAME_LEN)]

# Convert list into a DataFrame
all_frames_df = pd.DataFrame(data_list)

# Convert dataframe to tensor
tensor_data = tf.convert_to_tensor(all_frames_df.values, dtype=tf.float32)

print(tensor_data)


FEATURE_COLUMNS = ['x_right_hand_0', 'x_right_hand_1', 'x_right_hand_2', 'x_right_hand_3', 'x_right_hand_4', 'x_right_hand_5', 'x_right_hand_6', 'x_right_hand_7', 'x_right_hand_8', 'x_right_hand_9', 'x_right_hand_10', 'x_right_hand_11', 'x_right_hand_12', 'x_right_hand_13', 'x_right_hand_14', 'x_right_hand_15', 'x_right_hand_16', 'x_right_hand_17', 'x_right_hand_18', 'x_right_hand_19', 'x_right_hand_20', 'x_left_hand_0', 'x_left_hand_1', 'x_left_hand_2', 'x_left_hand_3', 'x_left_hand_4', 'x_left_hand_5', 'x_left_hand_6', 'x_left_hand_7', 'x_left_hand_8', 'x_left_hand_9', 'x_left_hand_10', 'x_left_hand_11', 'x_left_hand_12', 'x_left_hand_13', 'x_left_hand_14', 'x_left_hand_15', 'x_left_hand_16', 'x_left_hand_17', 'x_left_hand_18', 'x_left_hand_19', 'x_left_hand_20', 'x_pose_13', 'x_pose_15', 'x_pose_17', 'x_pose_19', 'x_pose_21', 'x_pose_14', 'x_pose_16', 'x_pose_18', 'x_pose_20', 'x_pose_22', 'y_right_hand_0', 'y_right_hand_1', 'y_right_hand_2', 'y_right_hand_3', 'y_right_hand_4', 'y_right_hand_5', 'y_right_hand_6', 'y_right_hand_7', 'y_right_hand_8', 'y_right_hand_9', 'y_right_hand_10', 'y_right_hand_11', 'y_right_hand_12', 'y_right_hand_13', 'y_right_hand_14', 'y_right_hand_15', 'y_right_hand_16', 'y_right_hand_17', 'y_right_hand_18', 'y_right_hand_19', 'y_right_hand_20', 'y_left_hand_0', 'y_left_hand_1', 'y_left_hand_2', 'y_left_hand_3', 'y_left_hand_4', 'y_left_hand_5', 'y_left_hand_6', 'y_left_hand_7', 'y_left_hand_8', 'y_left_hand_9', 'y_left_hand_10', 'y_left_hand_11', 'y_left_hand_12', 'y_left_hand_13', 'y_left_hand_14', 'y_left_hand_15', 'y_left_hand_16', 'y_left_hand_17', 'y_left_hand_18', 'y_left_hand_19', 'y_left_hand_20', 'y_pose_13', 'y_pose_15', 'y_pose_17', 'y_pose_19', 'y_pose_21', 'y_pose_14', 'y_pose_16', 'y_pose_18', 'y_pose_20', 'y_pose_22', 'z_right_hand_0', 'z_right_hand_1', 'z_right_hand_2', 'z_right_hand_3', 'z_right_hand_4', 'z_right_hand_5', 'z_right_hand_6', 'z_right_hand_7', 'z_right_hand_8', 'z_right_hand_9', 'z_right_hand_10', 'z_right_hand_11', 'z_right_hand_12', 'z_right_hand_13', 'z_right_hand_14', 'z_right_hand_15', 'z_right_hand_16', 'z_right_hand_17', 'z_right_hand_18', 'z_right_hand_19', 'z_right_hand_20', 'z_left_hand_0', 'z_left_hand_1', 'z_left_hand_2', 'z_left_hand_3', 'z_left_hand_4', 'z_left_hand_5', 'z_left_hand_6', 'z_left_hand_7', 'z_left_hand_8', 'z_left_hand_9', 'z_left_hand_10', 'z_left_hand_11', 'z_left_hand_12', 'z_left_hand_13', 'z_left_hand_14', 'z_left_hand_15', 'z_left_hand_16', 'z_left_hand_17', 'z_left_hand_18', 'z_left_hand_19', 'z_left_hand_20', 'z_pose_13', 'z_pose_15', 'z_pose_17', 'z_pose_19', 'z_pose_21', 'z_pose_14', 'z_pose_16', 'z_pose_18', 'z_pose_20', 'z_pose_22']

RHAND_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if "right" in col]
LHAND_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "left" in col]
RPOSE_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "pose" in col and int(col[-2:]) in RPOSE]
LPOSE_IDX = [i for i, col in enumerate(FEATURE_COLUMNS)  if  "pose" in col and int(col[-2:]) in LPOSE]


# transforming input/resizing

# Function to resize and add padding.
def resize_pad(x):
    if tf.shape(x)[0] < FRAME_LEN:
        x = tf.pad(x, ([[0, FRAME_LEN-tf.shape(x)[0]], [0, 0], [0, 0]]))
    else:
        x = tf.image.resize(x, (FRAME_LEN, tf.shape(x)[1]))
    return x

# Detect the dominant hand from the number of NaN values.
# Dominant hand will have less NaN values since it is in frame moving.
def pre_process(x):
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
    x = resize_pad(x)
    
    x = tf.where(tf.math.is_nan(x), tf.zeros_like(x), x)
    x = tf.reshape(x, (FRAME_LEN, len(LHAND_IDX) + len(LPOSE_IDX)))
    return x

# print(pre_process(tensor_data)) #calls on the landmarks object. need to check with the source code.
tensor_data = pre_process(tensor_data)

# making prediction

interpreter = tf.lite.Interpreter("model.tflite") # to load and run TFlite models exported into the .tflite format

REQUIRED_SIGNATURE = "serving_default" # to specify the required input signature for the model
REQUIRED_OUTPUT = "outputs" # to specify the required input tensor name for the Tensorflow lite model

with open ("character_to_prediction_index.json", "r") as f:
    character_map = json.load(f)
rev_character_map = {j:i for i,j in character_map.items()}

found_signatures = list(interpreter.get_signature_list().keys())

if REQUIRED_SIGNATURE not in found_signatures:
    raise ValueError('Required input signature not found.')

prediction_fn = interpreter.get_signature_runner("serving_default")
output = prediction_fn(inputs=tensor_data)
prediction_str = "".join([rev_character_map.get(s, "") for s in np.argmax(output[REQUIRED_OUTPUT], axis=1)])

print(prediction_str)

print("completed running after", time.time() - start_time)