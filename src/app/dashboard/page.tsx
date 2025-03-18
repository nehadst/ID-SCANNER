'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Dashboard Page
 * 
 * I created this page to display all saved ID records in a table format.
 * It fetches data from the Users API and renders it in a responsive table.
 * 
 * The dashboard features:
 * 1. A list of all saved ID records, sorted by most recent first
 * 2. Details like name, ID number, date of birth, and record creation date
 * 3. A way to navigate back to the scan page to add more records
 */

// I defined this interface to ensure type safety for user data
interface User {
  id: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  expiryDate: string | null;
  address: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export default function Dashboard() {
  // I use React state to manage the users list and UI states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // I use useEffect to fetch data when the component mounts
  useEffect(() => {
    // I created this async function to fetch users from our API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data.users || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    // I call the fetch function immediately when the component mounts
    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* I added a header with a navigation button to scan new IDs */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">ID Scanner Dashboard</h1>
          <Link 
            href="/scan" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition duration-300"
          >
            Scan New ID
          </Link>
        </div>

        {/* I handle different states (loading, error, empty) for better user experience */}
        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Loading records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/50 rounded-xl p-6 text-red-300">
            <p className="font-semibold mb-2">Error loading records</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-800/50 hover:bg-red-800/70 text-white px-4 py-2 rounded text-sm transition"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <p className="text-slate-400 mb-4">No ID records found.</p>
            <Link 
              href="/scan" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition duration-300"
            >
              Scan Your First ID
            </Link>
          </div>
        ) : (
          /* I created a responsive table to display all ID records */
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">ID Number</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Date of Birth</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-800/70 transition duration-150">
                      <td className="py-4 px-6">{user.fullName}</td>
                      <td className="py-4 px-6">{user.idNumber}</td>
                      <td className="py-4 px-6">{formatDate(user.dateOfBirth)}</td>
                      <td className="py-4 px-6">{formatDate(user.createdAt, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* I display the total record count at the bottom of the page */}
        {!loading && !error && users.length > 0 && (
          <div className="mt-4 text-right text-slate-400 text-sm">
            Total Records: {users.length}
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * I created this helper function to format dates in a user-friendly way
 * It handles both date-only strings and full ISO timestamps
 */
function formatDate(dateString: string, includeTime: boolean = false) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if invalid
    }
    
    if (includeTime) {
      return date.toLocaleString();
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return as-is on error
  }
} 