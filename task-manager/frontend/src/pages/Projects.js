import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', members: [] });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') fetchUsers();
  }, []);

  const fetchProjects = () => api.get('/projects').then(res => setProjects(res.data));
  const fetchUsers = () => api.get('/projects/users').then(res => setUsers(res.data));

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setForm({ title: '', description: '', members: [] });
    setShowForm(false);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id]
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Projects</h1>
        {user?.role === 'Admin' && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} placeholder="Project Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <textarea style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
          <p style={styles.label}>Add Members:</p>
          <div style={styles.memberList}>
            {users.map(u => (
              <label key={u._id} style={styles.memberItem}>
                <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
                <span>{u.name} ({u.role})</span>
              </label>
            ))}
          </div>
          <button style={styles.btn} type="submit">Create Project</button>
        </form>
      )}

      <div style={styles.grid}>
        {projects.length === 0 && <p style={styles.empty}>No projects yet.</p>}
        {projects.map(p => (
          <div key={p._id} style={styles.card}>
            <h3 style={styles.cardTitle}>{p.title}</h3>
            <p style={styles.cardDesc}>{p.description || 'No description'}</p>
            <p style={styles.cardMeta}>{p.members?.length || 0} member(s)</p>
            <div style={styles.cardActions}>
              <button style={styles.viewBtn} onClick={() => navigate(`/projects/${p._id}`)}>View Tasks</button>
              {user?.role === 'Admin' && (
                <button style={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', color: '#1a1a2e' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  form: { background: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  label: { fontSize: '13px', color: '#666', marginBottom: '8px' },
  memberList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  memberItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '18px', color: '#1a1a2e', marginBottom: '8px' },
  cardDesc: { fontSize: '13px', color: '#888', marginBottom: '12px' },
  cardMeta: { fontSize: '12px', color: '#aaa', marginBottom: '16px' },
  cardActions: { display: 'flex', gap: '8px' },
  viewBtn: { background: '#4361ee', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { background: '#fee', color: '#e94560', border: '1px solid #e94560', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  empty: { color: '#888', fontSize: '14px' }
};