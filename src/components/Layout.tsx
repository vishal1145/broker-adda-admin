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
          <div className="flex items-center px-6 space-x-8 ">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center mr-3 bg-primary">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Broker Adda</h1>
            </div>

            {/* Broker Region Menu */}
            <div className="flex items-center space-x-8 pl-20">
              <a
                href="/brokers"
                className={`text-sm font-medium transition-colors  ${
                  pathname === '/brokers'
                    ? 'text-primary '
                    : 'text-gray-700 hover:text-primary '
                }`}
              >
                Brokers
              </a>
              <a
                href="/regions"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/regions'
                    ? 'text-primary '
                    : 'text-gray-700 hover:text-primary border-transparent '
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
                {/* Admin Profile Image */}
                <div className="flex-shrink-0">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Admin Profile"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Rohit Tyagi</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
               
              </div>
            </div>
          </div>

        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

