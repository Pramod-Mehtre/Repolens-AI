import express from 'express';
// Removed SavedAnalysis import because the application does not use a database

export const savedAnalysisRouter = express.Router();

// Auth has been removed — saved analyses are disabled
const noAuth = (req, res) => res.status(401).json({ error: 'Authentication required' });

savedAnalysisRouter.post('/', noAuth);
savedAnalysisRouter.get('/', noAuth);
savedAnalysisRouter.get('/:id', noAuth);
savedAnalysisRouter.delete('/:id', noAuth);
