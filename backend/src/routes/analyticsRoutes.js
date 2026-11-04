import express from 'express';
import {
  getSummary,
  getAIInsights,
  simulateScenario,
  predictProductionYield,
  getFlowAndEarningsPrediction,
  getAIProductionPrediction,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/ai-insights', getAIInsights);
router.get('/flow-earnings-forecast', getFlowAndEarningsPrediction);
router.get('/production-prediction', getAIProductionPrediction);
router.post('/production-prediction', getAIProductionPrediction);
router.post('/simulate', simulateScenario);
router.get('/predict-yield', predictProductionYield);
router.post('/predict-yield', predictProductionYield);

export default router;
