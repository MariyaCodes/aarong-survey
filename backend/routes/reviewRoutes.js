import { Router } from 'express';
import { authEmployee } from '../middleware/auth.js';
import { checkReview, submitReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/check/:productId/:employeeId', authEmployee, checkReview);
router.post('/', authEmployee, submitReview);

export default router;
