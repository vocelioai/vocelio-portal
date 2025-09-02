import React, { useEffect, useRef, useState } from 'react';
import { 
  MessageSquare, Download, Copy, Trash2, Clock, User, 
  Bot, CheckCircle, AlertCircle, Volume2, Search 
} from 'lucide-react';

const TranscriptBox = ({ transcript, isRecording, callSid }) => {
  const scrollRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [savedTranscripts, setSavedTranscripts] = useState([]);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Filter transcript based on search
  const filteredTranscript = transcript.filter(entry =>
    entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate transcript stats
  const stats = {
    totalLines: transcript.length,
    totalWords: transcript.reduce((acc, entry) => acc + entry.text.split(' ').length, 0),
    averageConfidence: transcript.length > 0 
      ? (transcript.reduce((acc, entry) => acc + (entry.confidence || 0), 0) / transcript.length * 100).toFixed(1)
      : 0,
    speakers: [...new Set(transcript.map(entry => entry.speaker))].length,
    duration: transcript.length > 0 
      ? Math.round((new Date() - new Date(transcript[0].timestamp)) / 1000)
      : 0
  };

  // Save transcript
  const saveTranscript = () => {
    const transcriptData = {
      id: callSid || Date.now().toString(),
      timestamp: new Date().toISOString(),
      callSid,
      entries: transcript,
      stats,
      duration: formatDuration(stats.duration)
    };
    
    setSavedTranscripts(prev => [transcriptData, ...prev]);
    
    // Also save to localStorage
    const saved = JSON.parse(localStorage.getItem('vocilio_transcripts') || '[]');
    saved.unshift(transcriptData);
    localStorage.setItem('vocilio_transcripts', JSON.stringify(saved.slice(0, 50))); // Keep last 50
  };

  // Copy transcript to clipboard
  const copyTranscript = async () => {
    const text = transcript
      .map(entry => `[${formatTime(entry.timestamp)}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  // Download transcript as text file
  const downloadTranscript = () => {
    const text = [
      `Vocilio AI Call Transcript`,
      `Call ID: ${callSid || 'Unknown'}`,
      `Date: ${new Date().toLocaleString()}`,
      `Duration: ${formatDuration(stats.duration)}`,
      `Total Words: ${stats.totalWords}`,
      `Average Confidence: ${stats.averageConfidence}%`,
      '',
      '--- TRANSCRIPT ---',
      '',
      ...transcript.map(entry => 
        `[${formatTime(entry.timestamp)}] ${entry.speaker}: ${entry.text}`
      )
    ].join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${callSid || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear transcript
  const clearTranscript = () => {
    if (window.confirm('Are you sure you want to clear the current transcript?')) {
      // This would need to be passed up to parent component
      // For now, we'll show the confirmation
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerIcon = (speaker) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('system')) {
      return <Bot className="h-4 w-4 text-blue-600" />;
    }
    return <User className="h-4 w-4 text-green-600" />;
  };

  const getSpeakerColor = (speaker) => {
    if (speaker.toLowerCase().includes('agent') || speaker.toLowerCase().includes('system')) {
      return 'border-l-blue-500 bg-blue-50';
    }
    return 'border-l-green-500 bg-green-50';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Live Transcript</h3>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Recording</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Stats"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
          
          <button
            onClick={copyTranscript}
            disabled={transcript.length === 0}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy Transcript"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={downloadTranscript}
            disabled={transcript.length === 0}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Transcript"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={saveTranscript}
            disabled={transcript.length === 0}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.totalLines}</div>
              <div className="text-xs text-gray-500">Lines</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.totalWords}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.averageConfidence}%</div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.speakers}</div>
              <div className="text-xs text-gray-500">Speakers</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{formatDuration(stats.duration)}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {transcript.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div 
        ref={scrollRef}
        className="h-64 overflow-y-auto border rounded-lg bg-gray-50 p-4 space-y-3"
      >
        {transcript.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transcript available</p>
              <p className="text-sm mt-1">Start a call to see live transcription</p>
            </div>
          </div>
        ) : filteredTranscript.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No matches found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          </div>
        ) : (
          filteredTranscript.map((entry, index) => (
            <div
              key={index}
              className={`border-l-4 pl-4 py-2 rounded-r-lg ${getSpeakerColor(entry.speaker)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getSpeakerIcon(entry.speaker)}
                  <span className="text-sm font-medium text-gray-700">
                    {entry.speaker}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {entry.confidence !== undefined && (
                    <span className={`font-medium ${getConfidenceColor(entry.confidence)}`}>
                      {(entry.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(entry.timestamp)}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-800 leading-relaxed">
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {transcript.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredTranscript.length} of {transcript.length} entries
            {searchTerm && ` (filtered)`}
          </span>
          
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>Live ASR Active</span>
              </div>
            )}
            
            <span>
              Auto-save: {callSid ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptBox;
