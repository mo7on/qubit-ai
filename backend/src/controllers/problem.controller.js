const db = require('../models');
const { generateTextResponse, analyzeImageAndGenerateResponse } = require('../utils/gemini');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const Problem = db.Problem;
const Solution = db.Solution;
const User = db.User;

// Create a new problem
exports.createProblem = async (req, res) => {
  try {
    const { title, description, category, difficulty } = req.body;
    const userId = req.userId;
    
    // Handle image uploads if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const problem = await Problem.create({
      title,
      description,
      category,
      difficulty,
      imageUrls,
      userId
    });
    
    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ message: 'Error creating problem', error: error.message });
  }
};

// Get all problems
exports.getAllProblems = async (req, res) => {
  try {
    const { category, difficulty, status } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    
    const problems = await Problem.findAll({
      where: filter,
      include: [{
        model: User,
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Error fetching problems', error: error.message });
  }
};

// Get problem by ID
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        },
        {
          model: Solution,
          include: [{
            model: User,
            attributes: ['id', 'username']
          }]
        }
      ]
    });
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.status(200).json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Error fetching problem', error: error.message });
  }
};

// Update problem
exports.updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, status } = req.body;
    const userId = req.userId;
    
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the owner or an admin
    if (problem.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }
    
    // Handle image uploads if any
    let imageUrls = problem.imageUrls;
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    }
    
    await problem.update({
      title: title || problem.title,
      description: description || problem.description,
      category: category || problem.category,
      difficulty: difficulty || problem.difficulty,
      status: status || problem.status,
      imageUrls
    });
    
    res.status(200).json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ message: 'Error updating problem', error: error.message });
  }
};

// Delete problem
exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the owner or an admin
    if (problem.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }
    
    // Delete associated images from storage
    if (problem.imageUrls && problem.imageUrls.length > 0) {
      problem.imageUrls.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '../../public', imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      });
    }
    
    await problem.destroy();
    
    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ message: 'Error deleting problem', error: error.message });
  }
};

// Generate AI solution for a problem
exports.generateAiSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    let prompt = `Please solve the following problem: ${problem.title}\n\n${problem.description}`;
    let aiResponse;
    
    // If problem has images, analyze them
    if (problem.imageUrls && problem.imageUrls.length > 0) {
      // Process the first image for simplicity
      const imagePath = path.join(__dirname, '../../public', problem.imageUrls[0]);
      const imageBuffer = await readFileAsync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      aiResponse = await analyzeImageAndGenerateResponse(base64Image, prompt);
    } else {
      aiResponse = await generateTextResponse(prompt);
    }
    
    // Save the AI solution
    const solution = await Solution.create({
      content: aiResponse,
      isAiGenerated: true,
      problemId: id,
      userId // Associate with the requesting user
    });
    
    // Update problem status if it was open
    if (problem.status === 'open') {
      await problem.update({ status: 'in-progress' });
    }
    
    res.status(200).json({
      message: 'AI solution generated successfully',
      solution
    });
  } catch (error) {
    console.error('Error generating AI solution:', error);
    res.status(500).json({ message: 'Error generating AI solution', error: error.message });
  }
};

// Add user solution to a problem
exports.addSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;
    
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const solution = await Solution.create({
      content,
      isAiGenerated: false,
      problemId: id,
      userId
    });
    
    // Update problem status if it was open
    if (problem.status === 'open') {
      await problem.update({ status: 'in-progress' });
    }
    
    res.status(201).json({
      message: 'Solution added successfully',
      solution
    });
  } catch (error) {
    console.error('Error adding solution:', error);
    res.status(500).json({ message: 'Error adding solution', error: error.message });
  }
};

// Mark problem as solved
exports.markAsSolved = async (req, res) => {
  try {
    const { id } = req.params;
    const { solutionId } = req.body;
    const userId = req.userId;
    
    const problem = await Problem.findByPk(id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the owner or an admin
    if (problem.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to mark this problem as solved' });
    }
    
    // Verify the solution exists
    if (solutionId) {
      const solution = await Solution.findByPk(solutionId);
      if (!solution || solution.problemId !== id) {
        return res.status(404).json({ message: 'Solution not found for this problem' });
      }
    }
    
    await problem.update({ status: 'solved' });
    
    res.status(200).json({
      message: 'Problem marked as solved',
      problem
    });
  } catch (error) {
    console.error('Error marking problem as solved:', error);
    res.status(500).json({ message: 'Error marking problem as solved', error: error.message });
  }
};

module.exports = exports;