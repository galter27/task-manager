const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwtMiddleware = require('../middleware/authMiddleware');

// Get all tasks for the logged-in user
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.render('dashboard', { user: req.user, tasks: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Add a new task
router.post('/', jwtMiddleware, async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTask = new Task({
      title,
      description,
      user: req.user._id, // Associate task with the logged-in user
    });

    await newTask.save();
    res.redirect('/tasks'); // Redirect to the tasks page to see the newly added task
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Edit a task (update title, description)
router.put('/:id', jwtMiddleware, async (req, res) => {
  const { title, description } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description },
      { new: true } // Return the updated task
    );

    if (!task) {
      return res.status(404).send('Task not found or you do not have permission to edit this task');
    }

    res.redirect('/tasks'); // Redirect to the task list
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.patch('/:taskId/status', async (req, res) => {
    console.log('Received PATCH request to update status');
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).send('Task not found');
      }
  
      // Update task status
      task.status = req.body.status;
      await task.save();
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating task status');
    }
  });

// Edit Task route
router.get('/:taskId/edit', async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).send('Task not found');
      }
      res.render('edit', { task: task });  // Render edit page with task data
    } catch (err) {
      res.status(500).send('Error retrieving task');
    }
  });
  
  // Update Task route (handle form submission)
  router.patch('/:taskId', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.taskId,
        { title: req.body.title, description: req.body.description, status: req.body.status },
        { new: true }
      );
      if (!task) {
        return res.status(404).send('Task not found');
      }
      res.redirect('/dashboard');  // Redirect to the dashboard after successful update
    } catch (err) {
      res.status(500).send('Error updating task');
    }
  });

// Delete Task route
router.delete('/:taskId', async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.taskId);
      if (!task) {
        return res.status(404).send('Task not found');
      }
      res.redirect('/dashboard');  // Redirect to dashboard after deletion
    } catch (err) {
      res.status(500).send('Error deleting task');
    }
  });
  
  module.exports = router;