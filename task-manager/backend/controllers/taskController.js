const Task = require('../models/Task');

exports.getDashboard = async (req, res) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
    const tasks = await Task.find(query);
    const now = new Date();
    res.json({
      total:      tasks.length,
      completed:  tasks.filter(t => t.status === 'Completed').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      overdue:    tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'Completed').length
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTasks = async (req, res) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'title');
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const { title, project } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project required' });
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    if (req.user.role === 'Member') {
      if (task.assignedTo?.toString() !== req.user.id)
        return res.status(403).json({ message: 'Not authorized' });
      const updated = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      return res.json(updated);
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'title');
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};