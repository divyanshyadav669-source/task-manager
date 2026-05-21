import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
  const { user } = useAuth();

  useEffect(() => {
    api.get('/tasks/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Tasks',  value: stats.total,      color: '#4361ee' },
    { label: 'Completed',    value: stats.completed,   color: '#2ec4b6' },
    { label: 'In Progress',  value: stats.inProgress,  color: '#ff9f1c' },
    { label: 'Overdue',      value: stats.overdue,     color: '#e94560' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.name}</h1>
      <p style={styles.sub}>Role: <strong>{user?.role}</strong></p>
      <div style={styles.grid}>
        {cards.map(card => (
          <div key={card.label} style={{...styles.card, borderTop: `4px solid ${card.color}`}}>
            <div style={{...styles.value, color: card.color}}>{card.value}</div>
            <div style={styles.label}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '28px', color: '#1a1a2e', marginBottom: '4px' },
  sub: { color: '#888', marginBottom: '32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  value: { fontSize: '40px', fontWeight: '700', marginBottom: '8px' },
  label: { fontSize: '14px', color: '#666' }
};