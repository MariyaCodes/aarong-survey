import Product from '../models/Product.js';
import ProductLine from '../models/ProductLine.js';
import SurveyResponse from '../models/SurveyResponse.js';
import { appendSurveyToSheet } from '../utils/googleSheets.js';

const appendReviewToSheet = async (response) => {
  try {
    return await appendSurveyToSheet(response);
  } catch (err) {
    console.error('Google Sheets append error:', err.message || err);
    return false;
  }
};

export const checkReview = async (req, res) => {
  const { productId, employeeId } = req.params;
  if (!productId || !employeeId) {
    return res.status(400).json({ message: 'Product ID and Employee ID are required' });
  }

  if (employeeId.trim().toUpperCase() !== req.user.employeeId) {
    return res.status(403).json({ message: 'Employee ID must match the logged-in user' });
  }

  const existing = await SurveyResponse.findByEmployeeAndProduct(employeeId.trim().toUpperCase(), productId);
  if (existing) {
    return res.json({ alreadyReviewed: true, message: 'You have already reviewed this product.' });
  }

  return res.json({ alreadyReviewed: false, message: 'You can review this product.' });
};

export const submitReview = async (req, res) => {
  const { productId, answers } = req.body;

  if (!productId || !Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: 'Product ID and answers are required' });
  }

  const product = await Product.findByProductId(productId);
  if (!product || product.isActive === false) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const line = await ProductLine.findByLineId(product.productLineId);
  if (!line || line.isActive === false) {
    return res.status(404).json({ message: 'Product line not found' });
  }

  const employeeId = req.user.employeeId;
  const existing = await SurveyResponse.findByEmployeeAndProduct(employeeId, product.productId);
  if (existing) {
    return res.status(409).json({ message: 'You have already reviewed this product.' });
  }

  let response;
  try {
    response = await SurveyResponse.create({
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
  } catch (err) {
    if (err.code === 11000 || err.message?.includes('duplicate key')) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }
    throw err;
  }

  const synced = await appendReviewToSheet(response);
  if (synced) {
    await SurveyResponse.updateById(response.id, { syncedToSheet: true });
  }

  if (!synced) {
    return res.status(201).json({
      message: 'Review saved, but Google Sheets sync failed.',
      response,
    });
  }

  return res.status(201).json({ message: 'Review submitted successfully', response });
};
