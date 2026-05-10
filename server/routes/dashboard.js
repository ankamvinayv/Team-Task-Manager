// FILE: server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/dashboard — aggregated stats
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const taskFilter = isAdmin ? {} : { assignedTo: req.user.id };

    // Project count
    let totalProjects;
    if (isAdmin) {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = await Project.countDocuments({ 'members.user': req.user.id });
    }

    // Task counts
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'completed' }),
      Task.countDocuments({ ...taskFilter, status: 'pending' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
    ]);

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    // Tasks by priority
    const [highPriority, mediumPriority, lowPriority] = await Promise.all([
      Task.countDocuments({ ...taskFilter, priority: 'high' }),
      Task.countDocuments({ ...taskFilter, priority: 'medium' }),
      Task.countDocuments({ ...taskFilter, priority: 'low' }),
    ]);

    const tasksByPriority = [
      { name: 'High', value: highPriority },
      { name: 'Medium', value: mediumPriority },
      { name: 'Low', value: lowPriority },
    ];

    const tasksByStatus = [
      { name: 'Pending', value: pendingTasks },
      { name: 'In Progress', value: inProgressTasks },
      { name: 'Completed', value: completedTasks },
    ];

    // Recent activity — last 5 updated tasks
    const recentActivity = await Task.find(taskFilter)
      .populate('project', 'title')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status priority updatedAt');

    res.status(200).json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;
