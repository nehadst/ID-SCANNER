'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface IDScannerProps {
  onDataExtracted: (data: any) => void;
}

const IDScanner: React.FC<IDScannerProps> = ({ onDataExtracted }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload' | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
    } else {
      setError('Failed to capture image. Please try again.');
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Save file name for display
    setSelectedFileName(file.name);

    console.log("File selected:", file.name, file.type, file.size);
    alert(`File selected: ${file.name}`); // Add alert for clear feedback

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

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("File loaded successfully");
      const result = e.target?.result as string;
      setCapturedImage(result);
      
      // Add a clear confirmation message
      alert("Image loaded successfully! Click 'Process ID' to continue.");
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const resetState = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    setScanMethod(null);
    setError(null);
  };

  const retakeImage = () => {
    setCapturedImage(null);
    if (scanMethod === 'camera') {
      setIsCapturing(true);
    } else {
      setScanMethod(null);
    }
    setError(null);
  };

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
      // Limit the size of the image if it's too large
      let imageToSend = capturedImage;
      if (capturedImage.length > 1000000) {
        console.log("Image is large, truncating for display");
        // Still send full image, just log a shorter version
        console.log("Image data (start):", capturedImage.substring(0, 100));
        console.log("Image data (end):", capturedImage.substring(capturedImage.length - 100));
      }
      
      // Send the image to the backend for processing
      const response = await fetch('/api/scan-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageToSend }),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to process ID: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received data from API:", data);
      onDataExtracted(data);
    } catch (err) {
      console.error('Error processing ID:', err);
      setError('Error processing ID. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">ID Scanner</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
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
      ) : isCapturing ? (
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