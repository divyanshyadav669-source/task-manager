const Project = require('../models/Project');
const User = require('../models/User');

exports.getProjects = async (req, res) => {
  try {
    const query = req.user.role === 'Admin'
      ? { createdBy: req.user.id }
      : { members: req.user.id };
    const projects = await Project.find(query).populate('members', 'name email role');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const project = await Project.create({ title, description, createdBy: req.user.id, members: members || [] });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};