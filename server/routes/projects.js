// FILE: server/routes/projects.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/projects — list projects
router.get('/', auth, async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ 'members.user': req.user.id })
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .sort({ createdAt: -1 });
    }

    // Add task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedTaskCount = await Task.countDocuments({
          project: project._id,
          status: 'completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedTaskCount,
          memberCount: project.members.length,
        };
      })
    );

    res.status(200).json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// POST /api/projects — create project (admin only)
router.post(
  '/',
  auth,
  adminOnly,
  [body('title').trim().notEmpty().withMessage('Project title is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, dueDate, status } = req.body;

      const project = new Project({
        title,
        description: description || '',
        dueDate,
        status: status || 'active',
        owner: req.user.id,
        members: [{ user: req.user.id, role: 'admin' }],
      });

      await project.save();

      const populatedProject = await Project.findById(project._id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

      res.status(201).json(populatedProject);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ message: 'Server error creating project' });
    }
  }
);

// GET /api/projects/:id — get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get task counts by status
    const [pendingCount, inProgressCount, completedCount] = await Promise.all([
      Task.countDocuments({ project: project._id, status: 'pending' }),
      Task.countDocuments({ project: project._id, status: 'in-progress' }),
      Task.countDocuments({ project: project._id, status: 'completed' }),
    ]);

    const projectData = {
      ...project.toObject(),
      taskCounts: {
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        total: pendingCount + inProgressCount + completedCount,
      },
    };

    res.status(200).json(projectData);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

// PUT /api/projects/:id — update project (admin only)
router.put(
  '/:id',
  auth,
  adminOnly,
  [body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, dueDate, status } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (status !== undefined) updateData.status = status;

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json(project);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ message: 'Server error updating project' });
    }
  }
);

// DELETE /api/projects/:id — delete project + its tasks (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// POST /api/projects/:id/members — add member to project (admin only)
router.post(
  '/:id/members',
  auth,
  adminOnly,
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, role } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user is already a member
      const isMember = project.members.some(
        (m) => m.user.toString() === user._id.toString()
      );
      if (isMember) {
        return res.status(400).json({ message: 'User is already a member of this project' });
      }

      project.members.push({ user: user._id, role: role || 'member' });
      await project.save();

      const updatedProject = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email role');

      res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ message: 'Server error adding member' });
    }
  }
);

// DELETE /api/projects/:id/members/:userId — remove member from project (admin only)
router.delete('/:id/members/:userId', auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
});

module.exports = router;
