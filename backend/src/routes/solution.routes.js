const express = require('express');
const router = express.Router();
const solutionController = require('../controllers/solution.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get solutions for a problem
router.get('/problem/:problemId', solutionController.getSolutionsByProblem);

// Get a specific solution
router.get('/:id', solutionController.getSolutionById);

// Protected routes
router.post('/', verifyToken, solutionController.createSolution);
router.put('/:id', verifyToken, solutionController.updateSolution);
router.delete('/:id', verifyToken, solutionController.deleteSolution);
router.post('/:id/rate', verifyToken, solutionController.rateSolution);

module.exports = router;