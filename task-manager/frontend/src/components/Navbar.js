import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>TaskManager</div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
      </div>
      <div style={styles.right}>
        <span style={styles.user}>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', background: '#1a1a2e', color: '#fff' },
  brand: { fontWeight: '700', fontSize: '20px', color: '#e94560' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#aaa', textDecoration: 'none', fontSize: '14px' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  user: { fontSize: '13px', color: '#aaa' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }
};