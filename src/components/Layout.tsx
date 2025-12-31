'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Main content */}
      <div className="flex flex-col w-full overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          {/* Logo - Left side */}
          <div className="flex items-center px-4 md:px-6">
            <Link href="/dashboard" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
               <Image
                src="/images/logo.png"
                alt="Broker Adda Logo"
                width={32}
                height={32}
                className="mr-2 md:mr-3"
              />
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Broker Adda</h1>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/regions"
              className={`text-sm font-medium transition-colors ${
                pathname === '/regions'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Regions
            </Link>
            <Link
              href="/brokers"
              className={`text-sm font-medium transition-colors ${
                pathname === '/brokers'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Brokers
            </Link>
            <Link
              href="/leads"
              className={`text-sm font-medium transition-colors ${
                pathname === '/leads'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Enquiries
            </Link>
            <Link
              href="/properties"
              className={`text-sm font-medium transition-colors ${
                pathname === '/properties'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Properties
            </Link>
            <Link
              href="/support"
              className={`text-sm font-medium transition-colors ${
                pathname === '/support'
                  ? 'text-teal-600'
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Support
            </Link>
          </div>
          
          {/* Right side - Desktop */}
          <div className="hidden md:flex px-4 md:px-6 items-center">
            <div className="flex items-center space-x-3">
              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Profile */}
              <div className="hidden lg:flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Admin Profile"
                    width={32}
                    height={32}
                    unoptimized={true}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center justify-end flex-1 px-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/dashboard'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/regions"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/regions'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Regions
              </Link>
              <Link
                href="/brokers"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/brokers'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Brokers
              </Link>
              <Link
                href="/leads"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/leads'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Enquiries
              </Link>
              <Link
                href="/properties"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/properties'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Properties
              </Link>
              <Link
                href="/support"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/support'
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                }`}
              >
                Support
              </Link>
              
              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="px-6">
              {children}
            </div>
          </div>
        </main>

        {/* Global Toaster */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#2f2f2f',
              color: '#ffffff',
              border: '1px solid #3b3b3b',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />

        {/* Footer */}
        {/* <footer className="bg-white border-t border-gray-200 py-4">
          <div className="px-6">
            <div className="flex items-center justify-between">
             
              <div className="flex items-center space-x-6">
                <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Resources
                </a>
                <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Legal
                </a>
                <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </div>

         
            </div>
          </div>
        </footer> */}
      </div>
    </div>
  );
}

