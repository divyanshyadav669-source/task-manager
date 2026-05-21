import { useState, useEffect } from 'react';
import api from '../api/axios';

const statusColors = { 'Todo': '#4361ee', 'In Progress': '#ff9f1c', 'Completed': '#2ec4b6' };
const priorityColors = { 'Low': '#aaa', 'Medium': '#ff9f1c', 'High': '#e94560' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  const fetchTasks = () => api.get('/tasks').then(res => setTasks(res.data));

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks();
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tasks</h1>
      <div style={styles.filters}>
        {['All', 'Todo', 'In Progress', 'Completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{...styles.filterBtn, background: filter === f ? '#e94560' : '#fff', color: filter === f ? '#fff' : '#666'}}>
            {f}
          </button>
        ))}
      </div>
      <div style={styles.taskList}>
        {filtered.length === 0 && <p style={styles.empty}>No tasks found.</p>}
        {filtered.map(task => (
          <div key={task._id} style={styles.task}>
            <div style={styles.taskLeft}>
              <h3 style={styles.taskTitle}>{task.title}</h3>
              <p style={styles.taskDesc}>{task.description}</p>
              <div style={styles.tags}>
                <span style={{...styles.tag, background: priorityColors[task.priority] + '22', color: priorityColors[task.priority]}}>{task.priority}</span>
                <span style={styles.tagGray}>{task.project?.title || 'No Project'}</span>
                {task.dueDate && <span style={styles.tagGray}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <select style={{...styles.statusSelect, borderColor: statusColors[task.status], color: statusColors[task.status]}}
              value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
              <option>Todo</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '28px', color: '#1a1a2e', marginBottom: '20px' },
  filters: { display: 'flex', gap: '8px', marginBottom: '24px' },
  filterBtn: { padding: '8px 16px', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  task: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  taskLeft: { flex: 1 },
  taskTitle: { fontSize: '16px', color: '#1a1a2e', marginBottom: '4px' },
  taskDesc: { fontSize: '13px', color: '#888', marginBottom: '10px' },
  tags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  tagGray: { padding: '2px 10px', borderRadius: '12px', fontSize: '12px', background: '#f0f0f0', color: '#666' },
  statusSelect: { padding: '6px 10px', border: '1.5px solid', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', marginLeft: '16px' },
  empty: { color: '#888', fontSize: '14px' }
};