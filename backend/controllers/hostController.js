import Product from '../models/Product.js';
import ProductLine from '../models/ProductLine.js';
import SurveyResponse from '../models/SurveyResponse.js';
import Employee from '../models/Employee.js';
import {
  exportAllResponsesToSheet,
  getSheetUrl,
} from '../services/googleSheets.js';

export const getDashboard = async (_req, res) => {
  const [productCount, lineCount, responseCount, employeeCount] = await Promise.all([
    Product.countActive(),
    ProductLine.countActive(),
    SurveyResponse.countAll(),
    Employee.countActive(),
  ]);

  res.json({
    stats: { productCount, lineCount, responseCount, employeeCount },
    sheetUrl: getSheetUrl(),
  });
};

export const getProductLines = async (_req, res) => {
  const lines = await ProductLine.findAll();
  lines.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  res.json(lines);
};

export const updateProductLineQuestions = async (req, res) => {
  const { questions } = req.body;
  const line = await ProductLine.findByLineId(req.params.lineId);

  if (!line) {
    return res.status(404).json({ message: 'Product line not found' });
  }

  if (questions?.length) {
    const updatedQuestions = questions.map((q, i) => ({
      text: q.text,
      type: q.type || 'checkbox',
      options: q.options || [],
      order: q.order ?? i,
      isActive: q.isActive !== false,
    }));
    await ProductLine.updateById(line.id, { questions: updatedQuestions });
    line.questions = updatedQuestions;
  }

  res.json(line);
};

export const getProducts = async (_req, res) => {
  const products = await Product.findAll();
  products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByProductId(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, variant, price, unit, isActive } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (variant) updates.variant = variant;
  if (price !== undefined) updates.price = price;
  if (unit !== undefined) updates.unit = unit;
  if (isActive !== undefined) updates.isActive = isActive;

  const updatedProduct = await Product.updateById(product.id, updates);
  res.json(updatedProduct);
};

export const getResponses = async (_req, res) => {
  const responses = await SurveyResponse.findAll();
  responses.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
  res.json(responses);
};

export const exportToSheets = async (_req, res) => {
  const responses = await SurveyResponse.findAll();
  const rowCount = await exportAllResponsesToSheet(responses);

  await SurveyResponse.updateMany({ syncedToSheet: true });

  res.json({
    message: `Exported ${rowCount} rows to Google Sheets`,
    sheetUrl: getSheetUrl(),
  });
};

export const getEmployees = async (_req, res) => {
  const employees = await Employee.findActive();
  res.json(employees.map((employee) => {
    const { pin, ...safe } = employee;
    return safe;
  }));
};

export const exportCsv = async (_req, res) => {
  const responses = await SurveyResponse.findAll();

  const header =
    'Timestamp,Employee ID,Employee Name,Category,Product Line,Product Name,Variant,Product ID,Question,Answer\n';

  const rows = responses.flatMap((r) =>
    r.answers.map((a) => {
      const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      return [
        escape(r.createdAt?.toISOString?.() || ''),
        escape(r.employeeId),
        escape(r.employeeName),
        escape(r.category),
        escape(r.productLineName),
        escape(r.productName),
        escape(r.productVariant),
        escape(r.productId),
        escape(a.questionText),
        escape(Array.isArray(a.answer) ? a.answer.join('; ') : a.answer),
      ].join(',');
    })
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=survey-responses.csv');
  res.send(header + rows.join('\n'));
};
