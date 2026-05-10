// FILE: server/routes/tasks.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

// GET /api/tasks — list tasks with filters
router.get('/', auth, async (req, res) => {
  try {
    const { project, status, priority, assignedTo } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members can only see their own tasks
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add isOverdue computed field
    const tasksWithOverdue = tasks.map((task) => {
      const taskObj = task.toObject();
      taskObj.isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== 'completed';
      return taskObj;
    });

    res.status(200).json(tasksWithOverdue);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// POST /api/tasks — create task (admin only)
router.post(
  '/',
  auth,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, project, assignedTo, priority, dueDate } = req.body;

      // Verify the project exists
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Verify the assignee is a member of the project
      if (assignedTo) {
        const isMember = projectDoc.members.some(
          (m) => m.user.toString() === assignedTo
        );
        if (!isMember) {
          return res
            .status(400)
            .json({ message: 'Assigned user must be a member of the project' });
        }
      }

      const task = new Task({
        title,
        description: description || '',
        project,
        assignedTo: assignedTo || null,
        createdBy: req.user.id,
        priority: priority || 'medium',
        dueDate,
      });

      await task.save();

      const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name');

      res.status(201).json(populatedTask);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Server error creating task' });
    }
  }
);

// GET /api/tasks/:id — get single task with comments
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    const taskObj = task.toObject();
    taskObj.comments = comments;
    taskObj.isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'completed';

    res.status(200).json(taskObj);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update all fields
      const { title, description, assignedTo, priority, status, dueDate, project } =
        req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (project !== undefined) task.project = project;
    } else {
      // Member can only update status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({
          message: 'Status must be pending, in-progress, or completed',
        });
      }
      task.status = status;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name');

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// DELETE /api/tasks/:id — delete task (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete associated comments
    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

// POST /api/tasks/:id/comments — add comment to task
router.post(
  '/:id/comments',
  auth,
  [body('text').trim().notEmpty().withMessage('Comment text is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const comment = new Comment({
        task: task._id,
        author: req.user.id,
        text: req.body.text,
      });

      await comment.save();

      const comments = await Comment.find({ task: task._id })
        .populate('author', 'name')
        .sort({ createdAt: 1 });

      res.status(201).json(comments);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Server error adding comment' });
    }
  }
);

module.exports = router;
