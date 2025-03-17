"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import IDScanner from '../../components/IDScanner';
import PageContainer from '../../components/PageContainer';
import PageTitle from '../../components/PageTitle';

interface IDData {
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  expiryDate: string;
  address: string;
}

export default function ScanPage() {
  const [formData, setFormData] = useState<IDData>({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    expiryDate: '',
    address: '',
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDataExtracted = (data: any) => {
    setFormData({
      fullName: data.fullName || '',
      idNumber: data.idNumber || '',
      dateOfBirth: data.dateOfBirth || '',
      expiryDate: data.expiryDate || '',
      address: data.address || '',
    });
    setIsScanning(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit the form data to the API
      const response = await fetch('/api/scan-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          // We'd normally submit image data here, but for manual form submission
          // we're just sending the form data directly
          formData
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit ID information');
      }
      
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Error submitting ID information:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <PageTitle 
          title="Scan ID Document" 
          description="Extract information from ID documents quickly and accurately"
        />
        
        {submissionStatus === 'success' ? (
          <div className="max-w-lg mx-auto glass-card overflow-hidden my-8">
            <div className="bg-emerald-900/50 p-5 border-b border-emerald-900">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-emerald-200">Success!</h3>
                  <p className="text-emerald-300 text-sm">Your ID information has been saved.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex flex-col space-y-4">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setFormData({
                      fullName: '',
                      idNumber: '',
                      dateOfBirth: '',
                      expiryDate: '',
                      address: '',
                    });
                    setSubmissionStatus('idle');
                  }}
                >
                  Scan Another ID
                </button>
                <Link 
                  href="/dashboard"
                  className="btn-outline text-center"
                >
                  View All Records
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2">
              <div className="glass-card overflow-hidden h-full">
                <div className="primary-gradient p-4 text-white">
                  <h2 className="text-xl font-semibold">Scan Document</h2>
                  <p className="text-blue-50 text-sm mt-1">Use your camera to extract ID information</p>
                </div>
                
                <div className="p-6">
                  {isScanning ? (
                    <IDScanner onDataExtracted={handleDataExtracted} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="mb-6 p-4 rounded-full bg-blue-900/50 shadow-lg">
                        <svg className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <button
                        onClick={() => setIsScanning(true)}
                        className="btn-primary w-full max-w-xs text-lg font-medium"
                      >
                        Start Camera Scan
                      </button>
                      <p className="mt-4 text-sm text-slate-300 text-center max-w-xs">
                        Position your ID document clearly in front of the camera for best results
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="glass-card overflow-hidden h-full">
                <div className="accent-gradient p-4 text-white">
                  <h2 className="text-xl font-semibold">Manual Entry</h2>
                  <p className="text-pink-100 text-sm mt-1">Enter ID information by hand</p>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="form-label" htmlFor="fullName">
                        Full Name
                      </label>
                      <input
                        className="form-input"
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name as shown on ID"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label" htmlFor="idNumber">
                        ID Number
                      </label>
                      <input
                        className="form-input"
                        id="idNumber"
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        placeholder="Enter ID number"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label" htmlFor="dateOfBirth">
                        Date of Birth
                      </label>
                      <input
                        className="form-input"
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label" htmlFor="expiryDate">
                        Expiry Date
                      </label>
                      <input
                        className="form-input"
                        id="expiryDate"
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label" htmlFor="address">
                        Address
                      </label>
                      <textarea
                        className="form-input"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address as shown on ID"
                        rows={3}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`btn-secondary w-full text-lg font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Information'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 