import React, { useState } from 'react';
import { Mail, Plus, Users, BarChart2, Edit, Calendar, Clock, CheckCircle, XCircle, X, Copy } from 'lucide-react';
import { enrollCandidateInSequence, cancelSequenceForCandidate, getSequenceStatus } from './courier-integration';
import DatePicker from './components/DatePicker';
import SequenceStepEditor from './components/SequenceStepEditor';
import CandidateStatus from './components/CandidateStatus';
import Header from './components/Header';
import DashboardView from './components/views/DashboardView';
import CandidatesView from './components/views/CandidatesView';
import SequencesView from './components/views/SequencesView';
import ReportsView from './components/views/ReportsView';
import SequenceBuilderModal from './components/modals/SequenceBuilderModal';
import CandidateEnrollmentModal from './components/modals/CandidateEnrollmentModal';
import CandidateTrackingModal from './components/modals/CandidateTrackingModal';

// Import the CSS file
// Add this import to your actual file: import './app-styles.css';

// Sequence templates for quick creation
const sequenceTemplates = [
  {
    id: 'template-1',
    name: 'Technical Interview Pipeline',
    description: 'A sequence for technical candidates going through the interview process',
    steps: [
      { id: 1, emailTemplate: "Initial Contact", delay: null, checkStatus: false },
      { id: 2, emailTemplate: "Technical Assessment", delay: "2 days", checkStatus: true },
      { id: 3, emailTemplate: "Interview Preparation", delay: "3 days", checkStatus: true },
      { id: 4, emailTemplate: "Follow-up", delay: "1 week", checkStatus: true }
    ]
  },
  {
    id: 'template-2',
    name: 'Sales Team Onboarding',
    description: 'A sequence for new sales team members',
    steps: [
      { id: 1, emailTemplate: "Welcome Email", delay: null, checkStatus: false },
      { id: 2, emailTemplate: "Training Schedule", delay: "1 day", checkStatus: false },
      { id: 3, emailTemplate: "Product Overview", delay: "3 days", checkStatus: false },
      { id: 4, emailTemplate: "Sales Process", delay: "5 days", checkStatus: false },
      { id: 5, emailTemplate: "First Week Check-in", delay: "1 week", checkStatus: true }
    ]
  },
  {
    id: 'template-3',
    name: 'Candidate Rejection',
    description: 'A sequence for candidates who did not pass the interview',
    steps: [
      { id: 1, emailTemplate: "Thank You Email", delay: null, checkStatus: false },
      { id: 2, emailTemplate: "Feedback Request", delay: "1 week", checkStatus: false }
    ]
  }
];

const RecruiterApp = () => {
  const [activeTab, setActiveTab] = useState('sequences');
  const [sequences, setSequences] = useState([
    { 
      id: 1, 
      name: 'Technical Interview Pipeline',
      steps: 3,
      candidates: 12,
      active: true
    },
    { 
      id: 2, 
      name: 'Sales Team Onboarding',
      steps: 5,
      candidates: 8,
      active: true
    }
  ]);
  
  const [showSequenceBuilder, setShowSequenceBuilder] = useState(false);
  const [showCandidateEnrollment, setShowCandidateEnrollment] = useState(false);
  const [showCandidateTracking, setShowCandidateTracking] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [selectedTrackingSequence, setSelectedTrackingSequence] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Mock sequence being built
  const [currentSequence, setCurrentSequence] = useState({
    name: "Product Team Welcome Series",
    steps: [
      { id: 1, emailTemplate: "Welcome Email", delay: null, checkStatus: false },
      { id: 2, emailTemplate: "Background Form", delay: "2 days", checkStatus: true },
      { id: 3, emailTemplate: "Interview Preparation", delay: "3 days", checkStatus: true }
    ]
  });
  
  // Sample candidates
  const candidates = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", status: "active", progress: 2, sequence: "Technical Interview Pipeline" },
    { id: 2, name: "Taylor Smith", email: "taylor@example.com", status: "complete", progress: 3, sequence: "Technical Interview Pipeline" },
    { id: 3, name: "Jamie Garcia", email: "jamie@example.com", status: "active", progress: 1, sequence: "Sales Team Onboarding" }
  ];
  
  // Available email templates
  const emailTemplates = [
    "Welcome Email",
    "Background Form",
    "Interview Preparation",
    "Technical Assessment",
    "Team Introduction",
    "Next Steps"
  ];
  
  const [enrolledCandidates, setEnrolledCandidates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});

  const addSequenceStep = () => {
    const newStep = { 
      id: currentSequence.steps.length + 1, 
      emailTemplate: "", 
      delay: "1 day", 
      checkStatus: false 
    };
    setCurrentSequence({
      ...currentSequence,
      steps: [...currentSequence.steps, newStep]
    });
  };
  
  const removeStep = (stepId) => {
    setCurrentSequence({
      ...currentSequence,
      steps: currentSequence.steps.filter(step => step.id !== stepId)
    });
  };
  
  const updateStep = (stepId, field, value) => {
    setCurrentSequence({
      ...currentSequence,
      steps: currentSequence.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    });
  };
  
  const saveSequence = () => {
    if (editingSequence) {
      setSequences(sequences.map(seq => 
        seq.id === editingSequence.id 
          ? {
              ...seq,
              name: currentSequence.name,
              steps: currentSequence.steps.length,
              active: seq.active
            } 
          : seq
      ));
      setEditingSequence(null);
    } else {
      setSequences([...sequences, {
        id: sequences.length + 1,
        name: currentSequence.name,
        steps: currentSequence.steps.length,
        candidates: 0,
        active: true
      }]);
    }
    setShowSequenceBuilder(false);
  };

  const editSequence = (sequence) => {
    setCurrentSequence({
      name: sequence.name,
      steps: Array.from({ length: sequence.steps }, (_, i) => ({
        id: i + 1,
        emailTemplate: emailTemplates[i % emailTemplates.length],
        delay: i === 0 ? null : `${i + 1} days`,
        checkStatus: i > 0
      }))
    });
    setEditingSequence(sequence);
    setShowSequenceBuilder(true);
  };

  const toggleSequenceStatus = (sequenceId) => {
    setSequences(sequences.map(seq => 
      seq.id === sequenceId ? { ...seq, active: !seq.active } : seq
    ));
  };

  const handleEnrollCandidate = async (candidate, sequence) => {
    if (!selectedDate) {
      alert('Please select a start date for the sequence');
      return;
    }

    try {
      setEnrollmentStatus(prev => ({ ...prev, [candidate.id]: 'enrolling' }));
      
      const result = await enrollCandidateInSequence(sequence, candidate, selectedDate);
      
      setEnrolledCandidates(prev => [
        ...prev,
        {
          id: `${candidate.id}-${sequence.id}`,
          candidateId: candidate.id,
          sequenceId: sequence.id,
          candidateName: candidate.name,
          sequenceName: sequence.name,
          startDate: selectedDate,
          runId: result.runId,
          cancellationToken: result.cancellationToken,
          status: 'active'
        }
      ]);
      
      setEnrollmentStatus(prev => ({ ...prev, [candidate.id]: 'success' }));
    } catch (error) {
      console.error('Error enrolling candidate:', error);
      setEnrollmentStatus(prev => ({ ...prev, [candidate.id]: 'error' }));
    }
  };

  const handleCancelSequence = async (enrollment) => {
    try {
      await cancelSequenceForCandidate(enrollment.cancellationToken);
      
      setEnrolledCandidates(prev => 
        prev.map(e => 
          e.id === enrollment.id 
            ? { ...e, status: 'cancelled' } 
            : e
        )
      );
    } catch (error) {
      console.error('Error cancelling sequence:', error);
    }
  };

  const handleCheckStatus = async (enrollment) => {
    try {
      const status = await getSequenceStatus(enrollment.runId);
      
      setEnrolledCandidates(prev => 
        prev.map(e => 
          e.id === enrollment.id 
            ? { ...e, status: status.status } 
            : e
        )
      );
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const showNewSequenceModal = () => {
    setEditingSequence(null);
    setCurrentSequence({
      name: "",
      steps: [
        { id: 1, emailTemplate: "", delay: null, checkStatus: false }
      ]
    });
    setShowSequenceBuilder(true);
  };

  const showTemplatesModal = () => {
    setShowTemplates(true);
  };

  const applyTemplate = (template) => {
    // Create a deep copy of the template to avoid reference issues
    const templateCopy = JSON.parse(JSON.stringify(template));
    
    // Remove the template ID and description
    delete templateCopy.id;
    delete templateCopy.description;
    
    // Set the current sequence to the template
    setCurrentSequence(templateCopy);
    
    // Close the templates modal and open the sequence builder
    setShowTemplates(false);
    setShowSequenceBuilder(true);
  };

  const handleEnrollClick = (sequence) => {
    setSelectedDate('');
    setShowCandidateEnrollment(true);
  };

  const handleTrackClick = (sequence) => {
    setSelectedTrackingSequence(sequence);
    setShowCandidateTracking(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'candidates' && <CandidatesView candidates={candidates} />}
          {activeTab === 'sequences' && (
            <SequencesView 
              sequences={sequences}
              onNewSequence={showNewSequenceModal}
              onEnrollClick={handleEnrollClick}
              onTrackClick={handleTrackClick}
              onEditSequence={editSequence}
              onToggleStatus={toggleSequenceStatus}
              onShowTemplates={showTemplatesModal}
            />
          )}
          {activeTab === 'reports' && <ReportsView />}
        </div>
      </main>

      {/* Modals */}
      <SequenceBuilderModal 
        show={showSequenceBuilder}
        onClose={() => setShowSequenceBuilder(false)}
        currentSequence={currentSequence}
        setCurrentSequence={setCurrentSequence}
        editingSequence={editingSequence}
        emailTemplates={emailTemplates}
        onSave={saveSequence}
        onAddStep={addSequenceStep}
        onRemoveStep={removeStep}
        onUpdateStep={updateStep}
      />

      <CandidateEnrollmentModal
        show={showCandidateEnrollment}
        onClose={() => setShowCandidateEnrollment(false)}
        sequences={sequences}
        candidates={candidates}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onEnrollCandidates={() => {
          // TODO: Implement enrollment logic
          setShowCandidateEnrollment(false);
        }}
      />

      <CandidateTrackingModal
        show={showCandidateTracking}
        onClose={() => setShowCandidateTracking(false)}
        sequences={sequences}
        candidates={candidates}
        selectedTrackingSequence={selectedTrackingSequence}
        setSelectedTrackingSequence={setSelectedTrackingSequence}
        onCheckAllStatus={() => {
          // TODO: Implement check all status logic
        }}
        onCheckStatus={(candidate) => {
          // TODO: Implement check status logic
        }}
        onCancelSequence={(candidate) => {
          // TODO: Implement cancel sequence logic
        }}
      />

      {/* Sequence Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sequence Templates
                </h2>
                <button 
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sequenceTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <button 
                        onClick={() => applyTemplate(template)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Use Template
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center mb-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{template.steps.length} steps</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Last step: {template.steps[template.steps.length - 1].delay || 'Immediate'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modify the NavLink component
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

export default RecruiterApp;