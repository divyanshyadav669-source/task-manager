import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = { 'Todo': '#4361ee', 'In Progress': '#ff9f1c', 'Completed': '#2ec4b6' };
const priorityColors = { 'Low': '#aaa', 'Medium': '#ff9f1c', 'High': '#e94560' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') api.get('/projects/users').then(res => setUsers(res.data));
  }, [id]);

  const fetchTasks = () =>
    api.get(`/tasks/project/${id}`).then(res => setTasks(res.data));

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/tasks', { ...form, project: id });
    setForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
    setShowForm(false);
    fetchTasks();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/tasks/${editTask._id}`, editTask);
    setEditTask(null);
    fetchTasks();
  };

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete task?')) {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    }
  };

  return (
    <div style={styles.container}>
      {/* Role badge */}
      <div style={styles.roleBadge(user?.role)}>
        {user?.role === 'Admin' ? '👑 Admin View — Full Control' : '👤 Member View — Your Tasks Only'}
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>Project Tasks</h1>
        {user?.role === 'Admin' && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        )}
        {user?.role === 'Member' && (
          <div style={styles.memberNote}>You can update the status of tasks assigned to you.</div>
        )}
      </div>

      {/* Admin: Create Task Form */}
      {user?.role === 'Admin' && showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <h3 style={styles.formTitle}>Create New Task</h3>
          <input style={styles.input} placeholder="Task Title *" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} required />
          <textarea style={styles.input} placeholder="Description" rows={2}
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div style={styles.row}>
            <select style={styles.select} value={form.assignedTo}
              onChange={e => setForm({...form, assignedTo: e.target.value})}>
              <option value="">Assign to member...</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
            <select style={styles.select} value={form.priority}
              onChange={e => setForm({...form, priority: e.target.value})}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <input style={styles.select} type="date" value={form.dueDate}
              onChange={e => setForm({...form, dueDate: e.target.value})} />
          </div>
          <button style={styles.btn} type="submit">Create Task</button>
        </form>
      )}

      {/* Admin: Edit Task Form */}
      {user?.role === 'Admin' && editTask && (
        <form onSubmit={handleUpdate} style={{...styles.form, borderColor: '#ff9f1c'}}>
          <h3 style={styles.formTitle}>Edit Task</h3>
          <input style={styles.input} placeholder="Task Title" value={editTask.title}
            onChange={e => setEditTask({...editTask, title: e.target.value})} required />
          <textarea style={styles.input} placeholder="Description" rows={2}
            value={editTask.description}
            onChange={e => setEditTask({...editTask, description: e.target.value})} />
          <div style={styles.row}>
            <select style={styles.select} value={editTask.assignedTo?._id || editTask.assignedTo || ''}
              onChange={e => setEditTask({...editTask, assignedTo: e.target.value})}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <select style={styles.select} value={editTask.priority}
              onChange={e => setEditTask({...editTask, priority: e.target.value})}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <select style={styles.select} value={editTask.status}
              onChange={e => setEditTask({...editTask, status: e.target.value})}>
              <option>Todo</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
          <div style={styles.row}>
            <button style={styles.btn} type="submit">Save Changes</button>
            <button style={styles.cancelBtn} type="button" onClick={() => setEditTask(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={styles.taskList}>
        {tasks.length === 0 && (
          <div style={styles.empty}>
            {user?.role === 'Admin' ? 'No tasks yet. Click "+ Add Task" to create one.' : 'No tasks assigned to you yet.'}
          </div>
        )}
        {tasks.map(task => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
          const isAssignedToMe = task.assignedTo?._id === user?.id || task.assignedTo === user?.id;
          const canEdit = user?.role === 'Admin' || isAssignedToMe;

          return (
            <div key={task._id} style={{...styles.task, borderLeft: `4px solid ${isOverdue ? '#e94560' : statusColors[task.status]}`}}>
              <div style={styles.taskLeft}>
                <div style={styles.taskTitleRow}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  {isOverdue && <span style={styles.overdueBadge}>OVERDUE</span>}
                </div>
                {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                <div style={styles.tags}>
                  <span style={{...styles.tag, background: priorityColors[task.priority] + '22', color: priorityColors[task.priority]}}>
                    {task.priority} priority
                  </span>
                  <span style={styles.tagGray}>
                    👤 {task.assignedTo?.name || 'Unassigned'}
                  </span>
                  {task.dueDate && (
                    <span style={{...styles.tagGray, color: isOverdue ? '#e94560' : '#666'}}>
                      📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.taskRight}>
                {/* Status — editable if Admin OR assigned member */}
                {canEdit ? (
                  <select style={{...styles.statusSelect, borderColor: statusColors[task.status], color: statusColors[task.status]}}
                    value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                    <option>Todo</option><option>In Progress</option><option>Completed</option>
                  </select>
                ) : (
                  <span style={{...styles.statusBadge, background: statusColors[task.status] + '22', color: statusColors[task.status]}}>
                    {task.status}
                  </span>
                )}

                {/* Admin-only actions */}
                {user?.role === 'Admin' && (
                  <div style={styles.adminActions}>
                    <button style={styles.editBtn} onClick={() => setEditTask(task)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(task._id)}>🗑️ Delete</button>
                  </div>
                )}

                {/* Member hint */}
                {user?.role === 'Member' && !isAssignedToMe && (
                  <span style={styles.lockedBadge}>🔒 Not assigned to you</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
  roleBadge: (role) => ({
    display: 'inline-block', marginBottom: '16px',
    padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
    background: role === 'Admin' ? '#fff3cd' : '#e8f4fd',
    color: role === 'Admin' ? '#856404' : '#0c5460',
    border: `1px solid ${role === 'Admin' ? '#ffc107' : '#bee5eb'}`
  }),
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '26px', color: '#1a1a2e', margin: 0 },
  memberNote: { fontSize: '13px', color: '#888', fontStyle: 'italic' },
  btn: { background: '#e94560', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  cancelBtn: { background: '#f0f0f0', color: '#666', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  form: { background: '#fff', padding: '24px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #eee' },
  formTitle: { margin: '0 0 16px', color: '#1a1a2e', fontSize: '16px' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
  row: { display: 'flex', gap: '10px', marginBottom: '12px' },
  select: { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  task: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' },
  taskLeft: { flex: 1 },
  taskTitleRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
  taskTitle: { fontSize: '16px', color: '#1a1a2e', margin: 0, fontWeight: '500' },
  overdueBadge: { background: '#ffeef0', color: '#e94560', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  taskDesc: { fontSize: '13px', color: '#888', marginBottom: '10px', marginTop: '4px' },
  tags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tag: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  tagGray: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', background: '#f5f5f5', color: '#666' },
  taskRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' },
  statusSelect: { padding: '6px 10px', border: '2px solid', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', background: '#fff' },
  statusBadge: { padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' },
  adminActions: { display: 'flex', gap: '6px' },
  editBtn: { background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { background: '#ffeef0', color: '#e94560', border: '1px solid #e94560', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  lockedBadge: { fontSize: '12px', color: '#aaa', fontStyle: 'italic' },
  empty: { padding: '40px', textAlign: 'center', color: '#aaa', background: '#fafafa', borderRadius: '8px', fontSize: '14px' }
};