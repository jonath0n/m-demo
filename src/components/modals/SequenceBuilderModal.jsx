import React, { useState, useEffect } from 'react';
import { Plus, X, Code, Copy, Check, ChevronDown, ChevronUp, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const SequenceBuilderModal = ({
  show,
  onClose,
  currentSequence,
  setCurrentSequence,
  editingSequence,
  emailTemplates,
  onSave,
  onAddStep,
  onRemoveStep,
  onUpdateStep
}) => {
  const [copied, setCopied] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!show) return null;

  // Function to validate the sequence
  const validateSequence = () => {
    const errors = [];
    
    // Check if sequence name is empty
    if (!currentSequence.name.trim()) {
      errors.push("Sequence name is required");
    }
    
    // Check if there are any steps
    if (currentSequence.steps.length === 0) {
      errors.push("At least one step is required");
    }
    
    // Check each step for required fields
    currentSequence.steps.forEach((step, index) => {
      if (!step.emailTemplate) {
        errors.push(`Step ${index + 1}: Email template is required`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Function to handle save with validation
  const handleSave = () => {
    if (validateSequence()) {
      onSave();
    }
  };

  // Function to generate the Courier ad hoc automation code based on the current sequence
  const generateCourierCode = () => {
    const steps = currentSequence.steps.map((step, index) => {
      // Create the base step for sending an email
      const stepCode = {
        action: "send",
        message: {
          to: {
            email: "{{profile.email}}"
          },
          template: step.emailTemplate
        }
      };

      // If status check is enabled, wrap the send step in a conditional flow
      if (step.checkStatus) {
        return {
          action: "if",
          condition: "data.candidate_status === 'active'",
          steps: [
            {
              action: "fetch-data",
              webhook: {
                url: "https://api.mcr.com/candidates/{{profile.id}}/status",
                method: "GET",
                headers: {
                  "Authorization": "Bearer {{env.MCR_API_KEY}}"
                }
              },
              merge_strategy: "soft-merge"
            },
            stepCode
          ]
        };
      }

      // Add delay if specified
      if (index > 0 && step.delay) {
        const delayValue = step.delay.split(' ')[0];
        const delayUnit = step.delay.split(' ')[1];
        
        return [
          {
            action: "delay",
            duration: `${delayValue} ${delayUnit}`
          },
          stepCode
        ];
      }

      return stepCode;
    });

    // Flatten the array of steps
    const flattenedSteps = steps.flat();

    return JSON.stringify({
      steps: flattenedSteps
    }, null, 2);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCourierCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCodePreview = () => {
    setShowCodePreview(!showCodePreview);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[1200px] h-[calc(100vh-32px)] flex flex-col">
        <div className="flex-1 flex min-h-0">
          {/* Left side - Sequence Editor */}
          <div className="w-1/2 flex flex-col min-h-0 border-r border-gray-200">
            <div className="flex-none p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-blue-600">
                  {editingSequence ? 'Edit Sequence' : 'Create New Sequence'}
                </h2>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-lg mx-auto">
                <div>
                  <label htmlFor="sequence-name" className="block text-sm font-medium text-gray-700">
                    Sequence Name
                  </label>
                  <input
                    type="text"
                    id="sequence-name"
                    value={currentSequence.name}
                    onChange={(e) => setCurrentSequence({...currentSequence, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter sequence name"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Sequence Steps</h3>
                    <button 
                      onClick={onAddStep}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentSequence.steps.map((step, index) => (
                      <div 
                        key={step.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Step {index + 1}</h4>
                          <button 
                            onClick={() => onRemoveStep(step.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Template
                            </label>
                            <select
                              value={step.emailTemplate}
                              onChange={(e) => onUpdateStep(step.id, 'emailTemplate', e.target.value)}
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">Select a template</option>
                              {emailTemplates.map(template => (
                                <option key={template} value={template}>
                                  {template}
                                </option>
                              ))}
                            </select>
                          </div>

                          {index > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delay After Previous Step
                              </label>
                              <select
                                value={step.delay || ''}
                                onChange={(e) => onUpdateStep(step.id, 'delay', e.target.value)}
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">No delay</option>
                                <option value="1 day">1 day</option>
                                <option value="2 days">2 days</option>
                                <option value="3 days">3 days</option>
                                <option value="1 week">1 week</option>
                                <option value="2 weeks">2 weeks</option>
                              </select>
                            </div>
                          )}

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`check-status-${step.id}`}
                              checked={step.checkStatus}
                              onChange={(e) => onUpdateStep(step.id, 'checkStatus', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`check-status-${step.id}`} className="ml-2 block text-sm text-gray-700">
                              Check candidate status before sending
                            </label>
                            <div className="relative ml-2">
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                              >
                                <HelpCircle className="w-4 h-4" />
                              </button>
                              {showTooltip && (
                                <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-md shadow-lg">
                                  When enabled, the system will check the candidate's status in MCR before sending the email. 
                                  The email will only be sent if the candidate's status is "active".
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Code Preview */}
          <div className="w-1/2 flex flex-col min-h-0 bg-gray-900">
            <div className="flex-none p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Code className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-white">Courier Ad Hoc Automation Code</h3>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-all duration-200"
                  title="Copy code to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <SyntaxHighlighter 
                language="json" 
                style={vscDarkPlus}
                customStyle={{ 
                  margin: 0,
                  background: 'transparent',
                  fontSize: '0.875rem',
                  height: '100%'
                }}
              >
                {generateCourierCode()}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <div className="flex-none border-t border-gray-200 p-4 bg-white">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {editingSequence ? 'Update Sequence' : 'Create Sequence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceBuilderModal; 