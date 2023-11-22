import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';


// Mocking modules and functions that the component uses
jest.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: jest.fn(),
  },
  HandLandmarker: {
    createFromOptions: jest.fn(),
  },
  PoseLandmarker: {
    createFromOptions: jest.fn(),
  },
}));

jest.mock('@mediapipe/drawing_utils', () => ({
  drawConnectors: jest.fn(),
  drawLandmarks: jest.fn(),
  lerp: jest.fn(),
}));

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Enable Webcam')).toBeInTheDocument();
    // Add more expectations here to test different parts of the component
  });

  // More tests can be added here
});
