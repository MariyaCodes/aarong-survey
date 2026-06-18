import { Router } from 'express';
import { employeeLogin, hostLogin } from '../controllers/authController.js';

const router = Router();

router.post('/employee/login', employeeLogin);
router.post('/host/login', hostLogin);

export default router;
