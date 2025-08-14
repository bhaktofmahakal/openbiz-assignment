import React from 'react';

export const UdyamHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      {/* Top Navigation */}
      <nav className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-blue-200 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-200 transition-colors">NIC Code</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Useful Documents</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Print / Verify</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Update Details</a>
            </div>
            <div>
              <a href="#" className="hover:text-blue-200 transition-colors text-sm">Login</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Udyam Registration</h1>
                <p className="text-sm text-gray-600">Ministry of MSME</p>
              </div>
            </div>
            
            {/* Government of India Logo */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Government of India</p>
                <p className="text-xs text-gray-500">Ministry of Micro, Small and Medium Enterprises</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">GOI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};