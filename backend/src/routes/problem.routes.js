const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problem.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', problemController.getAllProblems);
router.get('/:id', problemController.getProblemById);

// Protected routes
router.post('/', verifyToken, upload.array('images', 5), problemController.createProblem);
router.put('/:id', verifyToken, upload.array('images', 5), problemController.updateProblem);
router.delete('/:id', verifyToken, problemController.deleteProblem);
router.post('/:id/ai-solution', verifyToken, problemController.generateAiSolution);
router.post('/:id/solutions', verifyToken, problemController.addSolution);
router.patch('/:id/mark-solved', verifyToken, problemController.markAsSolved);

module.exports = router;