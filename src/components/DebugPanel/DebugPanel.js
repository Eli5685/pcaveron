import React, { useState } from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const DebugToggle = styled.button`
  background: #007acc;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: #005a9e;
  }
`;

const DebugModal = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: monospace;
  font-size: 12px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const LogEntry = styled.div`
  margin-bottom: 8px;
  padding: 4px;
  border-left: 3px solid ${props => {
    switch (props.type) {
      case 'error': return '#ff4444';
      case 'warning': return '#ff8800';
      case 'success': return '#44ff44';
      default: return '#4488ff';
    }
  }};
  background: ${props => {
    switch (props.type) {
      case 'error': return '#fff5f5';
      case 'warning': return '#fffbf0';
      case 'success': return '#f0fff0';
      default: return '#f5f9ff';
    }
  }};
`;

const DebugPanel = ({ logs = [], supabaseStatus, telegramData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getLogType = (message) => {
    if (message.includes('❌') || message.includes('Ошибка')) return 'error';
    if (message.includes('⚠️')) return 'warning';
    if (message.includes('✅')) return 'success';
    return 'info';
  };

  return (
    <DebugContainer>
      {isOpen && (
        <DebugModal>
          <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
          
          <h4>🛠️ Debug Information</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Supabase:</strong> {supabaseStatus || 'Unknown'}<br/>
            <strong>Environment:</strong> {process.env.NODE_ENV}<br/>
            <strong>Telegram WebApp:</strong> {window.Telegram?.WebApp ? 'Yes' : 'No'}<br/>
          </div>
          
          {telegramData && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Telegram User:</strong><br/>
              <pre style={{ fontSize: '10px', background: '#f0f0f0', padding: '5px' }}>
                {JSON.stringify(telegramData, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <strong>Console Logs:</strong>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {logs.slice(-10).map((log, index) => (
                <LogEntry key={index} type={getLogType(log)}>
                  {log}
                </LogEntry>
              ))}
              {logs.length === 0 && (
                <div style={{ color: '#666', fontStyle: 'italic' }}>No logs yet...</div>
              )}
            </div>
          </div>
        </DebugModal>
      )}
      
      <DebugToggle onClick={() => setIsOpen(!isOpen)}>
        🔧
      </DebugToggle>
    </DebugContainer>
  );
};

export default DebugPanel;