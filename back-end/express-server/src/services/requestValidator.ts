import * as yup from 'yup';
import fs from 'fs';

// Define schema for a single landmark
const coordinateSchema = yup.object().shape({
  x: yup.number().required(),
  y: yup.number().required(),
  z: yup.number().required(),
});

// Define schema for handLandmarks and poseLandmarks
const landmarksArraySchema = yup.array().of(
  yup.array().of(coordinateSchema)
);

const worldLandmarksArraySchema = yup.array().of(
  yup.array().of(coordinateSchema)
)


const handednessSchema = yup.object().shape({
  score: yup.number().required(),
  index: yup.number().required(),
  categoryName: yup.string().required(),
  displayName: yup.string().required(),
});

const handednessArraySchema = yup.array().of(
  yup.array().of(handednessSchema)
);

const handednessesArraySchema = yup.array().of(
  yup.array().of(handednessSchema)
)


const fullHandLandmarkerResultSchema = yup.object().shape({
  landmarks: landmarksArraySchema.required(),
  worldLandmarks: worldLandmarksArraySchema.required(),
  handedness: handednessArraySchema.required(),
  handednesses: handednessesArraySchema.required()
}
)

const fullPoseLandmarkerResultSchema = yup.object().shape({
  landmarks: landmarksArraySchema.required(),
  worldLandmarks: worldLandmarksArraySchema.required()
})


// Define the full schema for the JSON object
export const fullSchema = yup.object().shape({
  handLandmarks: yup.array().of(fullHandLandmarkerResultSchema).required(),
  poseLandmarks: yup.array().of(fullPoseLandmarkerResultSchema).required(),
});
