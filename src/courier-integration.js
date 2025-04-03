/**
 * Courier Integration for Mcr Recruiting
 * 
 * This file demonstrates how the Mcr application would integrate with Courier's
 * ad hoc automation API to send email sequences to candidates.
 */

/**
 * Converts a Mcr sequence to a Courier ad hoc automation
 * @param {Object} sequence - The sequence object from Mcr
 * @param {Object} candidate - The candidate object
 * @param {string} startDate - ISO date string for when to start the sequence
 * @returns {Object} - Courier ad hoc automation object
 */
export const createCourierAutomation = (sequence, candidate, startDate) => {
  // Generate a unique cancellation token for this automation run
  const cancellationToken = `mcr-${sequence.id}-${candidate.id}-${Date.now()}`;
  
  // Convert the sequence steps to Courier automation steps
  const steps = sequence.steps.map((step, index) => {
    const steps = [];
    
    // Add a delay step if this isn't the first step
    if (index > 0 && step.delay) {
      steps.push({
        action: "delay",
        duration: step.delay
      });
    }
    
    // Add a fetch data step if we need to check candidate status
    if (step.checkStatus) {
      steps.push({
        action: "fetch-data",
        webhook: {
          url: "https://api.mcr-recruiting.com/candidates/status",
          method: "GET",
          params: {
            candidateId: candidate.id,
            stepId: step.id
          }
        },
        merge_strategy: "soft-merge"
      });
    }
    
    // Add the send step
    steps.push({
      action: "send",
      message: {
        to: {
          email: candidate.email,
          firstName: candidate.name.split(' ')[0],
          lastName: candidate.name.split(' ').slice(1).join(' ')
        },
        template: step.emailTemplate,
        data: {
          candidateName: candidate.name,
          position: candidate.position || "the position",
          companyName: "Mcr",
          sequenceName: sequence.name
        }
      }
    });
    
    return steps;
  }).flat();
  
  // Create the full automation object
  return {
    steps: [
      // Add a delay to start the sequence on the specified date
      {
        action: "delay",
        until: startDate
      },
      // Add a cancellation step to allow stopping the sequence
      {
        action: "cancel",
        cancelation_token: cancellationToken
      },
      // Add all the sequence steps
      ...steps
    ]
  };
};

/**
 * Enrolls a candidate in a sequence
 * @param {Object} sequence - The sequence object
 * @param {Object} candidate - The candidate object
 * @param {string} startDate - ISO date string for when to start the sequence
 * @returns {Promise} - Promise that resolves when the enrollment is complete
 */
export const enrollCandidateInSequence = async (sequence, candidate, startDate) => {
  try {
    // Create the Courier automation
    const automation = createCourierAutomation(sequence, candidate, startDate);
    
    // Send the automation to Courier
    const response = await fetch('https://api.courier.com/automations/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COURIER_API_KEY}`
      },
      body: JSON.stringify(automation)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to enroll candidate: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return the run ID and cancellation token for tracking
    return {
      runId: result.runId,
      cancellationToken: `mcr-${sequence.id}-${candidate.id}-${Date.now()}`
    };
  } catch (error) {
    console.error('Error enrolling candidate:', error);
    throw error;
  }
};

/**
 * Cancels a sequence for a candidate
 * @param {string} cancellationToken - The cancellation token for the automation run
 * @returns {Promise} - Promise that resolves when the cancellation is complete
 */
export const cancelSequenceForCandidate = async (cancellationToken) => {
  try {
    // Send the cancellation request to Courier
    const response = await fetch('https://api.courier.com/automations/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COURIER_API_KEY}`
      },
      body: JSON.stringify({
        cancelation_token: cancellationToken
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cancel sequence: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error canceling sequence:', error);
    throw error;
  }
};

/**
 * Gets the status of a sequence for a candidate
 * @param {string} runId - The run ID for the automation
 * @returns {Promise} - Promise that resolves with the status
 */
export const getSequenceStatus = async (runId) => {
  try {
    // Get the status from Courier
    const response = await fetch(`https://api.courier.com/automations/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.COURIER_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get sequence status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting sequence status:', error);
    throw error;
  }
};

/**
 * Architecture Flowchart:
 * 
 * Mcr UI -> Mcr Backend -> Courier API -> Courier Email Service
 *     ^                                          |
 *     |                                          v
 *     +---------------------------------------- Status Updates
 * 
 * 1. Recruiter creates/edits a sequence in Mcr UI
 * 2. Sequence is saved to Mcr database
 * 3. Recruiter enrolls candidates in a sequence
 * 4. Mcr backend converts sequence to Courier ad hoc automation
 * 5. Automation is sent to Courier API
 * 6. Courier executes the automation, sending emails at specified intervals
 * 7. Courier reports status back to Mcr via webhooks
 * 8. Mcr UI displays status to recruiter
 */ 