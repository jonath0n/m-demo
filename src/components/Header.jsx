import React from 'react';
import { Mail, Users, BarChart2, Edit } from 'lucide-react';

const NavLink = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      active
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Email Sequences</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <NavLink 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart2 className="w-4 h-4 mr-2" />Dashboard
            </NavLink>
            <NavLink 
              active={activeTab === 'candidates'} 
              onClick={() => setActiveTab('candidates')}
            >
              <Users className="w-4 h-4 mr-2" />Candidates
            </NavLink>
            <NavLink 
              active={activeTab === 'sequences'} 
              onClick={() => setActiveTab('sequences')}
            >
              <Mail className="w-4 h-4 mr-2" />Email Sequences
            </NavLink>
            <NavLink 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
            >
              <Edit className="w-4 h-4 mr-2" />Reports
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 