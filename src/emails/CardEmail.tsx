import React from 'react';

interface CardEmailProps {
  cardImageUrl: string;
  message: string;
  fromName: string;
  bilingual: boolean;
  recipientName: string;
}

export const CardEmail: React.FC<CardEmailProps> = ({
  cardImageUrl,
  message,
  fromName,
  bilingual,
  recipientName,
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#DC143C', margin: '0 0 10px 0' }}>🍁 MapleCard</h1>
        <p style={{ fontSize: '18px', color: '#333', margin: '0 0 20px 0' }}>
          {recipientName ? `Hi ${recipientName}!` : 'You have a special card!'}
        </p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <img
          src={cardImageUrl}
          alt="MapleCard"
          style={{ width: '100%', borderRadius: '8px', display: 'block' }}
        />
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', border: '2px solid #DC143C', borderRadius: '8px', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', color: '#333', margin: '0 0 15px 0', fontStyle: 'italic' }}>
          "{message}"
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: '0', textAlign: 'right' }}>
          — {fromName}
        </p>
      </div>

      {bilingual && (
        <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#DC143C', margin: '0', fontWeight: 'bold' }}>
            Bienvenue / Welcome! 🇨🇦
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px', color: '#999', fontSize: '12px' }}>
        <p style={{ margin: '0' }}>Created with 🍁 MapleCard</p>
      </div>
    </div>
  );
};
