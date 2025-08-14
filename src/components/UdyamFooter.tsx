import React from 'react';

export const UdyamFooter: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      {/* Services Section */}
      <div className="bg-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">CHAMPIONS</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">MSME Samadhaan</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">MSME Sambandh</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">MSME Dashboard</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Entrepreneurship Skill Development Programme (ESDP)</a>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Ministry of MSME</h4>
            <p className="text-sm text-gray-600 mb-2">Udyog bhawan - New Delhi</p>
            <p className="text-sm text-gray-600 mb-2">
              Email: <a href="mailto:champions@gov.in" className="text-blue-600 hover:text-blue-800">champions@gov.in</a>
            </p>
            <p className="text-sm text-gray-600">
              <a href="#" className="text-blue-600 hover:text-blue-800">Contact Us</a> | 
              <a href="#" className="text-blue-600 hover:text-blue-800 ml-2">For Grievances / Problems</a>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright and NIC Information */}
      <div className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-600 space-y-1">
            <p>© Copyright Udyam Registration. All Rights Reserved</p>
            <p>Website Content Managed by Ministry of Micro Small and Medium Enterprises, GoI</p>
            <p>Website hosted & managed by National Informatics Centre, Ministry of Communications and IT, Government of India</p>
          </div>
        </div>
      </div>

      {/* Activities Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-yellow-800">
            <a href="#" className="underline hover:no-underline">
              Activities (NIC codes) not covered under MSMED Act, 2006 for Udyam Registration
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};