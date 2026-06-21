import Product from '../models/Product.js';
import ProductLine from '../models/ProductLine.js';
import SurveyResponse from '../models/SurveyResponse.js';
import { appendSurveyToSheet } from '../services/googleSheets.js';

export const getProducts = async (_req, res) => {
  const products = await Product.findAll();
  products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  res.json(products);
};

export const getProductSurvey = async (req, res) => {
  const product = await Product.findByProductId(req.params.productId);
  if (!product || product.isActive === false) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const line = await ProductLine.findByLineId(product.productLineId);
  if (!line || line.isActive === false) {
    return res.status(404).json({ message: 'Product line questions not found' });
  }

  const existing = await SurveyResponse.findByEmployeeAndProduct(req.user.employeeId, product.productId);

  const questions = line.questions
    .filter((q) => q.isActive !== false)
    .sort((a, b) => a.order - b.order);

  res.json({
    product,
    productLine: { lineId: line.lineId, name: line.name, category: line.category },
    questions,
    alreadySubmitted: Boolean(existing),
    previousResponse: existing || null,
    sharedQuestionsNote:
      'Questions are shared across all variants in this product line (e.g. Aloe Vera & Tulsi Face Wash use the same survey).',
  });
};

export const submitSurvey = async (req, res) => {
  const { productId, answers } = req.body;

  if (!productId || !answers?.length) {
    return res.status(400).json({ message: 'Product and answers are required' });
  }

  const product = await Product.findByProductId(productId);
  if (!product || product.isActive === false) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const line = await ProductLine.findByLineId(product.productLineId);
  if (!line || line.isActive === false) {
    return res.status(404).json({ message: 'Product line not found' });
  }

  const employeeId = req.user.employeeId?.trim().toUpperCase();
  const existing = await SurveyResponse.findByEmployeeAndProduct(employeeId, product.productId);

  if (existing) {
    return res.status(409).json({ message: 'You have already submitted this product survey' });
  }

  const response = await SurveyResponse.create({
    employeeId,
    employeeName: req.user.name,
    productId: product.productId,
    productName: product.name,
    productVariant: product.variant,
    productLineId: line.lineId,
    productLineName: line.name,
    category: product.category,
    answers,
    syncedToSheet: false,
  });

  const synced = await appendSurveyToSheet(response);
  if (synced) {
    await SurveyResponse.updateById(response.id, { syncedToSheet: true });
  }

  res.status(201).json({ message: 'Survey submitted successfully', response });
};

export const getMySurveys = async (req, res) => {
  const responses = await SurveyResponse.findByEmployeeId(req.user.employeeId);
  responses.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
  res.json(responses);
};
