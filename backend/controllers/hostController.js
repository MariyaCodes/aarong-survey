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
    Product.countDocuments({ isActive: true }),
    ProductLine.countDocuments({ isActive: true }),
    SurveyResponse.countDocuments(),
    Employee.countDocuments({ isActive: true }),
  ]);

  res.json({
    stats: { productCount, lineCount, responseCount, employeeCount },
    sheetUrl: getSheetUrl(),
  });
};

export const getProductLines = async (_req, res) => {
  const lines = await ProductLine.find().sort({ category: 1, name: 1 });
  res.json(lines);
};

export const updateProductLineQuestions = async (req, res) => {
  const { questions } = req.body;
  const line = await ProductLine.findOne({ lineId: req.params.lineId });

  if (!line) {
    return res.status(404).json({ message: 'Product line not found' });
  }

  if (questions?.length) {
    line.questions = questions.map((q, i) => ({
      text: q.text,
      type: q.type || 'checkbox',
      options: q.options || [],
      order: q.order ?? i,
      isActive: q.isActive !== false,
    }));
  }

  await line.save();
  res.json(line);
};

export const getProducts = async (_req, res) => {
  const products = await Product.find().sort({ category: 1, name: 1 });
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findOne({ productId: req.params.productId });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, variant, price, unit, isActive } = req.body;
  if (name) product.name = name;
  if (variant) product.variant = variant;
  if (price !== undefined) product.price = price;
  if (unit !== undefined) product.unit = unit;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();
  res.json(product);
};

export const getResponses = async (_req, res) => {
  const responses = await SurveyResponse.find().sort({ createdAt: -1 });
  res.json(responses);
};

export const exportToSheets = async (_req, res) => {
  const responses = await SurveyResponse.find().sort({ createdAt: -1 });
  const rowCount = await exportAllResponsesToSheet(responses);

  await SurveyResponse.updateMany({}, { syncedToSheet: true });

  res.json({
    message: `Exported ${rowCount} rows to Google Sheets`,
    sheetUrl: getSheetUrl(),
  });
};

export const getEmployees = async (_req, res) => {
  const employees = await Employee.find({ isActive: true }).select('-pin');
  res.json(employees);
};

export const exportCsv = async (_req, res) => {
  const responses = await SurveyResponse.find().sort({ createdAt: -1 });

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
