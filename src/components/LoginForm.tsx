// src/components/LoginForm.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

interface LoginFormProps {
  brandColors: {
    purple: string;
    orange: string;
  };
}

const LoginForm: React.FC<LoginFormProps> = ({ brandColors }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simple validation - just check that fields aren't empty
      if (!name.trim() || !email.trim()) {
        throw new Error('Name and email are required');
      }

      // Skip client-side email validation - let the server handle it
      // The API might have specific requirements we're not aware of

      // Attempt to login
      await login({ name, email });
      
      // Redirect to search page on success
      router.push('/search');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800 text-gray-800 text-base font-medium"
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800 text-gray-800 text-base font-medium"
            placeholder="youremail@example.com"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'}`}
          style={{ 
            backgroundColor: brandColors.orange,
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          By signing in, you agree to our Terms and Conditions and Privacy Policy
        </p>
      </form>
    </div>
  );
};

export default LoginForm;