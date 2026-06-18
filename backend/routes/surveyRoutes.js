import { Router } from 'express';
import { authEmployee } from '../middleware/auth.js';
import {
  getProducts,
  getProductSurvey,
  submitSurvey,
  getMySurveys,
} from '../controllers/surveyController.js';

const router = Router();

router.get('/products', authEmployee, getProducts);
router.get('/products/:productId/survey', authEmployee, getProductSurvey);
router.post('/submit', authEmployee, submitSurvey);
router.get('/my-surveys', authEmployee, getMySurveys);

export default router;
