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
  landmarks: landmarksArraySchema,
  worldLandmarks: worldLandmarksArraySchema,
  handedness: handednessArraySchema,
  handednesses: handednessesArraySchema
}
)

const fullPoseLandmarkerResultSchema = yup.object().shape({
  landmarks: landmarksArraySchema,
  worldLandmarks: worldLandmarksArraySchema
})


// Define the full schema for the JSON object
export const fullSchema = yup.object().shape({
  handLandmarks: yup.array().of(fullHandLandmarkerResultSchema),
  poseLandmarks: yup.array().of(fullPoseLandmarkerResultSchema),
});



// Function to read and validate JSON data
export const validateJsonData = (filePath: string) => {

  fs.readFile(filePath, 'utf8', (err, jsonString) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    try {
      const data = JSON.parse(jsonString);

      fullSchema.validate(data)
        .then(validatedData => {
          console.log('Validation succeeded:', validatedData);
        })
        .catch(validationError => {
          console.error('Validation failed:', validationError);
        });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
}

validateJsonData('/home/hang/Downloads/received_data.json');