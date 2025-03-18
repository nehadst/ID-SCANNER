'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

// I defined this interface to ensure type safety when passing props to the IDScanner component
// This helps me avoid runtime errors by catching type mismatches during development
interface IDScannerProps {
  onDataExtracted: (data: any) => void; // This callback function lets me send extracted data back to the parent component
}

/**
 * IDScanner Component
 * 
 * I created this component to handle ID document scanning functionality through:
 * 1. Camera capture - using device camera to take a photo of an ID document
 * 2. File upload - allowing users to upload an existing image file
 * 
 * The component integrates with the backend API to process images and extract ID information.
 */
const IDScanner: React.FC<IDScannerProps> = ({ onDataExtracted }) => {
  // I'm using multiple state variables to track the different aspects of the scanning process
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload' | null>(null); // Tracks which scan method the user selected
  const [isCapturing, setIsCapturing] = useState(false); // Controls whether the camera is active for capturing
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Stores the captured/uploaded image as a data URL
  const [isProcessing, setIsProcessing] = useState(false); // Indicates when the image is being processed by the API
  const [error, setError] = useState<string | null>(null); // Stores any error messages to display to the user
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null); // Tracks the name of an uploaded file for better UX

  // I'm using useRef to access the webcam component directly when I need to take a snapshot
  const webcamRef = useRef<Webcam>(null);

  // I implemented image capture as a useCallback to optimize performance
  // This avoids unnecessary re-renders when the component updates
  const captureImage = useCallback(() => {
    if (!webcamRef.current) {
      console.error("Webcam reference not available");
      return;
    }
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      console.log("Image captured successfully");
    } else {
      console.error("Failed to capture image");
      setError('Failed to capture image. Please try again.');
    }
  }, [webcamRef]);

  // This handler processes file uploads with validation for security and UX
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Save file name for display to improve user experience
    setSelectedFileName(file.name);

    console.log("File selected:", file.name, file.type, file.size);
    alert(`File selected: ${file.name}`); // Added clear feedback for user action

    // I implemented file validation for better security and reliability
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Please select a file under 5MB.');
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file.');
      return;
    }

    // I'm using FileReader API to handle file uploads asynchronously
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("File loaded successfully");
      const result = e.target?.result as string;
      setCapturedImage(result);
      
      // I added explicit UI feedback to guide users through the process
      alert("Image loaded successfully! Click 'Process ID' to continue.");
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // I added this reset function to improve UX by allowing users to restart the process
  const resetState = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    setScanMethod(null);
    setError(null);
  };

  // This function lets users retake images if they're not satisfied
  // It improves user experience by providing flexibility
  const retakeImage = () => {
    setCapturedImage(null);
    if (scanMethod === 'camera') {
      setIsCapturing(true);
    } else {
      setScanMethod(null);
    }
    setError(null);
  };

  // The core function that sends the image to the backend API for processing
  const processImage = async () => {
    if (!capturedImage) {
      console.error("Cannot process - no image captured");
      return;
    }
    
    console.log("Processing image, length:", capturedImage.length);
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Sending API request...");
      let imageToSend = capturedImage;
      if (capturedImage.length > 1000000) {
        console.log("Image is large, truncating for display");
        console.log("Image data (start):", capturedImage.substring(0, 100));
        console.log("Image data (end):", capturedImage.substring(capturedImage.length - 100));
      }
      
      // I'm sending the image to my API endpoint for processing with GPT-4o
      const response = await fetch('/api/scan-id/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageToSend }),
      });
      
      console.log("API response status:", response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(`Failed to process ID: ${response.status}`);
      }
      
      console.log("Received data from API:", data);
      // Pass extracted data back to parent component through the callback
      onDataExtracted(data);
    } catch (err) {
      console.error('Error processing ID:', err);
      setError('Error processing ID. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    // I used a container with Tailwind CSS for responsive design
    // This ensures the component looks good on different screen sizes
    <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">ID Scanner</h2>
      
      {/* I implemented error handling with visual feedback */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* I added a loading overlay to provide feedback during processing */}
      {/* This improves UX by indicating background activity */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-center font-semibold">Processing ID document...</p>
              <p className="text-center text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Initial method selection screen */}
      {/* I implemented a clear UI flow that guides users through each step */}
      {!scanMethod && !capturedImage ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center">Choose how you want to scan your ID document</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScanMethod('camera');
                setIsCapturing(true);
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Use Camera
            </button>
            {/* I used a label+input pattern for better accessibility and styling */}
            <label htmlFor="main-file-upload" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Upload Document
            </label>
            <input 
              id="main-file-upload"
              type="file"
              onChange={(e) => {
                setScanMethod('upload');
                handleFileUpload(e);
              }}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      ) : scanMethod === 'camera' && isCapturing ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md border-2 border-dashed border-gray-400 mb-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
              videoConstraints={{
                facingMode: "environment"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
              <div className="w-[80%] h-[60%] border-2 border-white"></div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={captureImage}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Capture ID
            </button>
            <button
              onClick={resetState}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : scanMethod === 'upload' && !capturedImage ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center">Select an image of your ID document</p>
          <label htmlFor="file-upload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 cursor-pointer">
            Choose File
          </label>
          <input 
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="text-sm text-gray-600 mb-4">
            Click "Choose File" and then select your ID image. 
            Make sure to click once to select and then click "Open".
          </div>
          <button
            onClick={resetState}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      ) : capturedImage ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mb-4">
            {selectedFileName && (
              <div className="text-center mb-2 font-semibold text-blue-600">
                Selected file: {selectedFileName}
              </div>
            )}
            <img src={capturedImage} alt="Captured ID" className="w-full border rounded" />
          </div>
          <div className="flex gap-4">
            <button
              onClick={processImage}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Process ID'}
            </button>
            <button
              onClick={retakeImage}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={isProcessing}
            >
              {scanMethod === 'camera' ? 'Retake Photo' : 'Choose Another File'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default IDScanner; 