import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0f1a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Shelter App Test</h1>
      <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
        Если вы видите это сообщение, то фронтенд работает корректно!
      </p>
      <div style={{
        backgroundColor: '#10b981',
        padding: '20px 40px',
        borderRadius: '12px',
        marginTop: '2rem'
      }}>
        ✅ Frontend is working
      </div>
    </div>
  );
};

export default TestPage;
