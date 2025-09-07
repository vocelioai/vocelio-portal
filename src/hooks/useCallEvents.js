import { useState, useEffect, useRef } from 'react';
import { callTransferAPI } from '../config/api.js';

// Custom hook for real-time call events using EventSource
export const useCallEvents = (callId) => {
  const [callState, setCallState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!callId) {
      setCallState(null);
      setConnected(false);
      return;
    }

    // Create EventSource connection
    const eventSourceUrl = callTransferAPI.getCallEventsUrl(callId);
    const eventSource = new EventSource(eventSourceUrl);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
      console.log(`Connected to call events for call ${callId}`);
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update call state based on event type
        switch (data.type) {
          case 'call_status_update':
            setCallState(prev => ({
              ...prev,
              status: data.status,
              duration: data.duration,
              lastUpdate: new Date().toISOString()
            }));
            break;
            
          case 'transfer_initiated':
            setCallState(prev => ({
              ...prev,
              status: 'transferring',
              transferDetails: {
                targetDepartment: data.target_department,
                transferType: data.transfer_type,
                initiatedAt: data.timestamp
              }
            }));
            break;
            
          case 'transfer_completed':
            setCallState(prev => ({
              ...prev,
              status: 'transferred',
              currentDepartment: data.target_department,
              transferDetails: {
                ...prev.transferDetails,
                completedAt: data.timestamp,
                success: true
              }
            }));
            break;
            
          case 'transfer_failed':
            setCallState(prev => ({
              ...prev,
              status: 'active',
              transferDetails: {
                ...prev.transferDetails,
                completedAt: data.timestamp,
                success: false,
                error: data.error_message
              }
            }));
            break;
            
          case 'call_ended':
            setCallState(prev => ({
              ...prev,
              status: 'ended',
              endedAt: data.timestamp,
              totalDuration: data.total_duration
            }));
            break;
            
          default:
            console.log('Unknown event type:', data.type);
        }
      } catch (err) {
        console.error('Failed to parse event data:', err);
        setError('Failed to parse real-time data');
      }
    };

    // Handle errors
    eventSource.onerror = (event) => {
      setConnected(false);
      setError('Connection to real-time updates lost');
      console.error('EventSource error:', event);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect...');
          // The useEffect will run again and create a new connection
        }
      }, 5000);
    };

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnected(false);
    };
  }, [callId]);

  // Manual reconnect function
  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setError(null);
    // The useEffect will handle creating a new connection
  };

  return {
    callState,
    connected,
    error,
    reconnect
  };
};

// Hook for monitoring multiple calls
export const useActiveCallsEvents = () => {
  const [activeCalls, setActiveCalls] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Create EventSource for all active calls
    const eventSource = new EventSource(`${callTransferAPI.getCallEventsUrl('').replace('/calls//events', '/calls/active/events')}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      console.log('Connected to active calls events');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'active_calls_update') {
          setActiveCalls(data.active_calls || []);
        } else if (data.type === 'call_update') {
          // Update specific call in the list
          setActiveCalls(prev => 
            prev.map(call => 
              call.call_id === data.call_id 
                ? { ...call, ...data.updates }
                : call
            )
          );
        }
      } catch (err) {
        console.error('Failed to parse active calls event:', err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.error('Active calls EventSource error');
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setConnected(false);
    };
  }, []);

  return {
    activeCalls,
    connected,
    updateActiveCalls: setActiveCalls
  };
};
