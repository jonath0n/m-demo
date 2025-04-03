import React from 'react';
import { Mail, Plus, Users, Edit, CheckCircle, XCircle, Copy } from 'lucide-react';

const SequencesView = ({ 
  sequences, 
  onNewSequence, 
  onEnrollClick, 
  onTrackClick, 
  onEditSequence, 
  onToggleStatus,
  onShowTemplates
}) => (
  <div className="p-6">
    <div className="flex items-start justify-between mb-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Email Sequences</h1>
        <p className="text-gray-600">Create and manage automated email sequences for your recruiting pipeline</p>
      </div>
      <div className="flex items-center space-x-3 ml-8">
        <button
          onClick={onShowTemplates}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <Copy className="w-4 h-4 mr-2" />
          Use Template
        </button>
        <button
          onClick={onNewSequence}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sequence
        </button>
      </div>
    </div>

    {/* Sequence Cards */}
    <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto w-full">
      {sequences.map(sequence => (
        <div key={sequence.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{sequence.name}</h3>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sequence.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sequence.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <Mail className="w-4 h-4 mr-1" /> {sequence.steps} steps
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {sequence.candidates} candidates
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                <button 
                  onClick={() => onEnrollClick(sequence)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Enroll
                </button>
                <button 
                  onClick={() => onTrackClick(sequence)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Track
                </button>
                <button 
                  onClick={() => onEditSequence(sequence)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
                <button 
                  onClick={() => onToggleStatus(sequence.id)}
                  className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    sequence.active 
                      ? 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500' 
                      : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                  }`}
                >
                  {sequence.active ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {sequence.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SequencesView; 