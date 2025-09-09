import React from 'react';
import { useGetChannelIntegrationsQuery, useGetActiveSessionsQuery, useGetDashboardAnalyticsQuery } from '../store/omnichannelApiSlice';

const OmnichannelApiTest = () => {
  const { 
    data: channels, 
    error: channelsError, 
    isLoading: channelsLoading 
  } = useGetChannelIntegrationsQuery();

  const { 
    data: sessions, 
    error: sessionsError, 
    isLoading: sessionsLoading 
  } = useGetActiveSessionsQuery();

  const { 
    data: analytics, 
    error: analyticsError, 
    isLoading: analyticsLoading 
  } = useGetDashboardAnalyticsQuery();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Omnichannel API Test Component</h1>
      
      {/* Channel Integrations Test */}
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>1. Channel Integrations API</h3>
        <p>Status: {channelsLoading ? '⏳ Loading...' : channelsError ? '❌ Error' : '✅ Success'}</p>
        {channelsError && (
          <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '3px' }}>
            Error: {JSON.stringify(channelsError, null, 2)}
          </div>
        )}
        {channels && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
            <p><strong>Channels Found:</strong> {Array.isArray(channels) ? channels.length : 'Invalid format'}</p>
            {Array.isArray(channels) && channels.length > 0 && (
              <ul>
                {channels.slice(0, 3).map((channel, index) => (
                  <li key={channel.id || index}>
                    {channel.name || channel.type} - Status: {channel.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Active Sessions Test */}
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>2. Active Sessions API</h3>
        <p>Status: {sessionsLoading ? '⏳ Loading...' : sessionsError ? '❌ Error' : '✅ Success'}</p>
        {sessionsError && (
          <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '3px' }}>
            Error: {JSON.stringify(sessionsError, null, 2)}
          </div>
        )}
        {sessions && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
            <p><strong>Active Sessions:</strong> {Array.isArray(sessions) ? sessions.length : 'Invalid format'}</p>
            {Array.isArray(sessions) && sessions.length > 0 && (
              <ul>
                {sessions.slice(0, 3).map((session, index) => (
                  <li key={session.session_id || index}>
                    Session {session.session_id} - Channel: {session.channel_type} - Status: {session.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Analytics Test */}
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>3. Dashboard Analytics API</h3>
        <p>Status: {analyticsLoading ? '⏳ Loading...' : analyticsError ? '❌ Error' : '✅ Success'}</p>
        {analyticsError && (
          <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '3px' }}>
            Error: {JSON.stringify(analyticsError, null, 2)}
          </div>
        )}
        {analytics && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
            <p><strong>Total Sessions:</strong> {analytics.totalSessions}</p>
            <p><strong>Active Channels:</strong> {analytics.activeChannels}</p>
            <p><strong>Response Time:</strong> {analytics.responseTime}s</p>
            <p><strong>Satisfaction Score:</strong> {analytics.satisfactionScore}/5</p>
          </div>
        )}
      </div>

      {/* Overall Status */}
      <div style={{ margin: '20px 0', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>📊 Overall Status</h3>
        <p>
          {(channelsLoading || sessionsLoading || analyticsLoading) ? (
            '⏳ Still loading some APIs...'
          ) : (channelsError || sessionsError || analyticsError) ? (
            '❌ Some APIs have errors - check above for details'
          ) : (
            '✅ All APIs working perfectly! Dashboard should load without issues.'
          )}
        </p>
      </div>
    </div>
  );
};

export default OmnichannelApiTest;
