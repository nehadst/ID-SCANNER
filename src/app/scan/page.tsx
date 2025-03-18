"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import IDScanner from '../../components/IDScanner';

/**
 * I defined this interface to store all the ID document fields
 * This helps me ensure type safety throughout the component
 */
interface IDData {
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  expiryDate: string;
  address: string;
}

/**
 * ScanPage Component
 * 
 * I created this page to allow users to:
 * 1. Scan ID documents using camera or file upload (via the IDScanner component)
 * 2. Manually enter ID document information through a form
 * 3. Submit the information to be saved in the database
 * 
 * The page has two modes (scanning and manual entry) that the user can toggle between.
 */
export default function ScanPage() {
  // I'm using state to manage the form data and UI states
  const [formData, setFormData] = useState<IDData>({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    expiryDate: '',
    address: '',
  });
  const [isScanning, setIsScanning] = useState(false); // Controls whether we're in scanning mode or manual entry mode
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks form submission state
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle'); // Tracks form submission result
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Stores error messages to display to user

  /**
   * I use this callback function to receive data extracted from scanned IDs
   * This gets called by the IDScanner component when an image is successfully processed
   */
  const handleDataExtracted = (data: any) => {
    // I populate the form with extracted data from the scanned ID
    setFormData({
      fullName: data.fullName || '',
      idNumber: data.idNumber || '',
      dateOfBirth: data.dateOfBirth || '',
      expiryDate: data.expiryDate || '',
      address: data.address || '',
    });
    // After extraction, I switch to form view so user can review and submit the data
    setIsScanning(false);
    // Reset any previous error messages
    setErrorMessage(null);
    setSubmissionStatus('idle');
  };

  /**
   * I handle form input changes and update state accordingly
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // I clear error messages when the user edits the ID number field
    // This provides immediate feedback that they're addressing the issue
    if (name === 'idNumber') {
      setErrorMessage(null);
    }
  };

  /**
   * I created this function to handle the traditional form submission approach
   * Note: Currently not used as we're using the direct URL approach below,
   * but I've kept it for potential future use or reference
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessage(null);
    
    try {
      // Submit the form data to the API
      const response = await fetch('/api/scan-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formData: {
            ...formData,
            idNumber: formData.idNumber.toString().trim()
          }
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.code === 'DUPLICATE_ID') {
          setErrorMessage('ID number already exists, please check your ID number again.');
          setSubmissionStatus('error');
        } else {
          throw new Error(responseData.error || 'Failed to submit ID information');
        }
      } else {
        setSubmissionStatus('success');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">ID Scanner</h1>
        
        {/* I created toggle buttons to switch between scanning and manual entry modes */}
        <div className="mb-6 flex justify-between">
          <button
            onClick={() => setIsScanning(true)}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              isScanning ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Camera Scan
          </button>
          <button
            onClick={() => setIsScanning(false)}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              !isScanning ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Manual Entry
          </button>
        </div>
        
        {isScanning ? (
          /* Scanner mode - shows the IDScanner component */
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl mb-6">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Scan ID Document</h2>
            <IDScanner onDataExtracted={handleDataExtracted} />
            <p className="mt-4 text-sm text-slate-300">
              Position your ID document clearly in front of the camera for best results
            </p>
          </div>
        ) : (
          /* Manual entry mode - shows the form */
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Manual Entry</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* I organized the form fields in a responsive grid layout */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    ID Number
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ID number"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="expiryDate"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address (optional)"
                />
              </div>
              
              <div>
                <button
                  id="submitButton"
                  type="button"
                  onClick={() => {
                    // I validate required fields before submission
                    if (!formData.fullName || !formData.idNumber || !formData.dateOfBirth) {
                      alert("Please fill in all required fields: Name, ID Number, and Date of Birth");
                      return;
                    }
                    
                    // I set loading state to provide user feedback
                    setIsSubmitting(true);
                    
                    // I'm using a URL parameter approach for form submission
                    // This passes data to the API via URL parameters instead of a POST request body
                    const url = `/api/minimal-save-form?name=${encodeURIComponent(formData.fullName)}&id=${encodeURIComponent(formData.idNumber.trim())}&dob=${encodeURIComponent(formData.dateOfBirth)}`;
                    
                    // I add optional fields only if they exist
                    const fullUrl = url 
                      + (formData.expiryDate ? `&expiry=${encodeURIComponent(formData.expiryDate)}` : '')
                      + (formData.address ? `&address=${encodeURIComponent(formData.address)}` : '');
                    
                    // I redirect to the API endpoint, which will handle the save and return HTML
                    window.location.href = fullUrl;
                  }}
                  className={`w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition duration-300 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'SAVE INFORMATION'}
                </button>
                
                {errorMessage && (
                  <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded">
                    {errorMessage}
                  </div>
                )}
                
                {submissionStatus === 'success' && (
                  <div className="mt-4 bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded">
                    ID information saved successfully!
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
            View all records
          </Link>
        </div>
      </div>
    </div>
  );
} 