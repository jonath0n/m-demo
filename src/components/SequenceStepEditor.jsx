import React from 'react';
import { X } from 'lucide-react';

const SequenceStepEditor = ({ step, onUpdate, emailTemplates, index, onRemove }) => {
  return (
    <div className="p-6 bg-white">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 mb-6">
        <span className="w-7 h-7 grid place-items-center rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
          {index + 1}
        </span>
        <h3 className="text-sm font-medium text-gray-900">Step {index + 1}</h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-8 h-8 grid place-items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 pl-11">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Email Template
          </label>
          <select
            value={step.emailTemplate}
            onChange={(e) => onUpdate({ ...step, emailTemplate: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select email template</option>
            {emailTemplates.map(template => (
              <option key={template} value={template}>{template}</option>
            ))}
          </select>
        </div>

        {index > 0 && (
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Wait Period
            </label>
            <select
              value={step.delay}
              onChange={(e) => onUpdate({ ...step, delay: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Send immediately</option>
              <option value="1">Wait 1 day</option>
              <option value="2">Wait 2 days</option>
              <option value="3">Wait 3 days</option>
              <option value="5">Wait 5 days</option>
              <option value="7">Wait 1 week</option>
              <option value="14">Wait 2 weeks</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-[auto,1fr] gap-2 items-start">
          <input
            type="checkbox"
            id={`check-response-${index}`}
            checked={step.checkStatus}
            onChange={(e) => onUpdate({ ...step, checkStatus: e.target.checked })}
            className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`check-response-${index}`} className="text-sm text-gray-600">
            Check for candidate response before proceeding
          </label>
        </div>
      </div>
    </div>
  );
};

export default SequenceStepEditor; 