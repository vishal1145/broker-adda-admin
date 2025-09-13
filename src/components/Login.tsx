'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (response.ok) {
        // Store token if provided (check nested structure)
        const token = data.data?.token || data.token || data.accessToken || data.access_token || data.authToken;
        if (token) {
          localStorage.setItem('adminToken', token);
          console.log('Token saved to localStorage:', token); // Debug log
        } else {
          console.log('No token found in response:', data); // Debug log
          setError('No authentication token received from server.');
          return;
        }
        router.push('/brokers');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#15193c' }}>
        <div className="relative z-10 flex flex-col justify-center items-center text-white w-full h-full px-8">
          {/* Logo - Top Left */}
          <div className="absolute top-16 ">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-primary">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-primary">Broker</span>
                <span className="text-white text-2xl font-bold ml-1">Adda</span>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center text-center max-w-md">
            {/* Login Image */}
            <div className="mb-8">
              <Image
                src="/images/login.png"
                alt="Login Illustration"
                width={350}
                height={280}
                className="object-contain"
                priority
              />
            </div>

            {/* Text */}
            <div>
              <h1 className="text-3xl font-bold mb-4 text-white">Easy To Use Dashboard</h1>
              <p className="text-lg text-gray-300">Real-time visitor management statistics</p>
            </div>
          </div>

        
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
       
        
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="admin@brokeradda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
}
