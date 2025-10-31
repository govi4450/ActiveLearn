const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const User = require('../models/User');

// Get all goals for a user
router.get('/:username', async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });
		
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const goals = await Goal.find({ userId: user._id })
			.sort({ createdAt: -1 });
		
		res.json(goals);
	} catch (error) {
		console.error('Error fetching goals:', error);
		res.status(500).json({ error: 'Failed to fetch goals' });
	}
});

// Create a new goal
router.post('/', async (req, res) => {
	try {
		const { username, type, target, metric, endDate } = req.body;
		
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const goal = new Goal({
			userId: user._id,
			type,
			target,
			metric,
			endDate
		});

		await goal.save();
		res.status(201).json(goal);
	} catch (error) {
		console.error('Error creating goal:', error);
		res.status(500).json({ error: 'Failed to create goal' });
	}
});

// Update goal progress
router.put('/:goalId', async (req, res) => {
	try {
		const { goalId } = req.params;
		const { current } = req.body;

		const goal = await Goal.findById(goalId);
		if (!goal) {
			return res.status(404).json({ error: 'Goal not found' });
		}

		goal.current = current;
		if (current >= goal.target) {
			goal.completed = true;
		}

		await goal.save();
		res.json(goal);
	} catch (error) {
		console.error('Error updating goal:', error);
		res.status(500).json({ error: 'Failed to update goal' });
	}
});

// Delete a goal
router.delete('/:goalId', async (req, res) => {
	try {
		const { goalId } = req.params;
		await Goal.findByIdAndDelete(goalId);
		res.json({ message: 'Goal deleted' });
	} catch (error) {
		console.error('Error deleting goal:', error);
		res.status(500).json({ error: 'Failed to delete goal' });
	}
});

module.exports = router;
