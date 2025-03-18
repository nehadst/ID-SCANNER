'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  useEffect(() => {
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

    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">ID Scanner Dashboard</h1>
          <Link 
            href="/scan" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition duration-300"
          >
            Scan New ID
          </Link>
        </div>

        {loading ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-300">Loading records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 text-red-100 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Error Loading Records</h3>
            <p>{error}</p>
            <button 
              onClick={() => router.refresh()}
              className="mt-4 bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">No Records Found</h2>
            <p className="text-slate-400 mb-6">No ID records have been saved yet.</p>
            <Link 
              href="/scan" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow transition duration-300"
            >
              Scan Your First ID
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">ID Number</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Date of Birth</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Expiry Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Added On</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-slate-200 font-medium">{user.fullName}</td>
                      <td className="py-3 px-4 text-slate-300">{user.idNumber}</td>
                      <td className="py-3 px-4 text-slate-300">{user.dateOfBirth}</td>
                      <td className="py-3 px-4 text-slate-300">{user.expiryDate || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => router.push(`/users/${user.id}`)}
                          className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Total Records: {users.length}</p>
        </div>
      </div>
    </main>
  );
} 