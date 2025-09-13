'use client';

import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar completely hidden */}
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      {/* Main content */}
      <div className="flex flex-col w-full overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          {/* Logo and Menu - Left side */}
          <div className="flex items-center px-6 space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center mr-3 bg-primary">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Broker Adda</h1>
            </div>

            {/* Broker Region Menu */}
            <div className="flex items-center space-x-8">
              <a
                href="/brokers"
                className={`text-sm font-medium transition-colors border-b-2 ${
                  pathname === '/brokers'
                    ? 'text-primary border-primary'
                    : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                }`}
              >
                Brokers
              </a>
              <a
                href="/regions"
                className={`text-sm font-medium transition-colors border-b-2 ${
                  pathname === '/regions'
                    ? 'text-primary border-primary'
                    : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                }`}
              >
                Regions
              </a>
            </div>
          </div>

          {/* Spacer to push user profile to the right */}
          <div className="flex-1"></div>
          
          {/* User Profile - Right side */}
          <div className="px-6 flex items-center">
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Rohit Tyagi</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <button className="ml-2 text-gray-400 hover:text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto   ">
            
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

