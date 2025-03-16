const db = require('../models');
const Solution = db.Solution;
const User = db.User;
const Problem = db.Problem;

// Get solutions for a problem
exports.getSolutionsByProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const solutions = await Solution.findAll({
      where: { problemId },
      include: [{
        model: User,
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(solutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ message: 'Error fetching solutions', error: error.message });
  }
};

// Get a specific solution
exports.getSolutionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const solution = await Solution.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'username']
      }]
    });
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }
    
    res.status(200).json(solution);
  } catch (error) {
    console.error('Error fetching solution:', error);
    res.status(500).json({ message: 'Error fetching solution', error: error.message });
  }
};

// Create a solution
exports.createSolution = async (req, res) => {
  try {
    const { content, problemId } = req.body;
    const userId = req.userId;
    
    // Check if problem exists
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const solution = await Solution.create({
      content,
      isAiGenerated: false,
      problemId,
      userId
    });
    
    // Update problem status if it was open
    if (problem.status === 'open') {
      await problem.update({ status: 'in-progress' });
    }
    
    res.status(201).json({
      message: 'Solution created successfully',
      solution
    });
  } catch (error) {
    console.error('Error creating solution:', error);
    res.status(500).json({ message: 'Error creating solution', error: error.message });
  }
};

// Update a solution
exports.updateSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;
    
    const solution = await Solution.findByPk(id);
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }
    
    // Check if user is the owner or an admin
    if (solution.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this solution' });
    }
    
    await solution.update({ content });
    
    res.status(200).json({
      message: 'Solution updated successfully',
      solution
    });
  } catch (error) {
    console.error('Error updating solution:', error);
    res.status(500).json({ message: 'Error updating solution', error: error.message });
  }
};

// Delete a solution
exports.deleteSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const solution = await Solution.findByPk(id);
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }
    
    // Check if user is the owner or an admin
    if (solution.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this solution' });
    }
    
    await solution.destroy();
    
    res.status(200).json({ message: 'Solution deleted successfully' });
  } catch (error) {
    console.error('Error deleting solution:', error);
    res.status(500).json({ message: 'Error deleting solution', error: error.message });
  }
};

// Rate a solution
exports.rateSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.userId;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const solution = await Solution.findByPk(id);
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }
    
    // Don't allow users to rate their own solutions
    if (solution.userId === userId) {
      return res.status(403).json({ message: 'You cannot rate your own solution' });
    }
    
    await solution.update({ rating });
    
    res.status(200).json({
      message: 'Solution rated successfully',
      solution
    });
  } catch (error) {
    console.error('Error rating solution:', error);
    res.status(500).json({ message: 'Error rating solution', error: error.message });
  }
};

module.exports = exports;