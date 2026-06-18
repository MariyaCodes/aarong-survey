import { Router } from 'express';
import { authHost } from '../middleware/auth.js';
import {
  getDashboard,
  getProductLines,
  updateProductLineQuestions,
  getProducts,
  updateProduct,
  getResponses,
  exportToSheets,
  exportCsv,
  getEmployees,
} from '../controllers/hostController.js';

const router = Router();

router.use(authHost);

router.get('/dashboard', getDashboard);
router.get('/product-lines', getProductLines);
router.put('/product-lines/:lineId/questions', updateProductLineQuestions);
router.get('/products', getProducts);
router.put('/products/:productId', updateProduct);
router.get('/responses', getResponses);
router.post('/export/sheets', exportToSheets);
router.get('/export/csv', exportCsv);
router.get('/employees', getEmployees);

export default router;
