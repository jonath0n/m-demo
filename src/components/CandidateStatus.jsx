import React from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const CandidateStatus = ({ enrollment, onRefresh, onCancel }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(enrollment.status)}
          <div>
            <h3 className="text-lg font-medium">{enrollment.candidateName}</h3>
            <p className="text-sm text-gray-500">{enrollment.sequenceName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
            {enrollment.status}
          </span>
          <button
            onClick={() => onRefresh(enrollment)}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            title="Refresh Status"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          {enrollment.status === 'active' && (
            <button
              onClick={() => onCancel(enrollment)}
              className="p-2 text-red-400 hover:text-red-600 focus:outline-none"
              title="Cancel Sequence"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Started: {new Date(enrollment.startDate).toLocaleDateString()}
      </div>
    </div>
  );
};

export default CandidateStatus; 