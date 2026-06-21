import { GoogleSpreadsheet } from 'google-spreadsheet';

const isConfigured = () =>
  process.env.GOOGLE_SHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY;

const getDoc = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc;
};

const ensureSheet = async (doc, title = 'Survey Responses') => {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({
      title,
      headerValues: [
        'Timestamp',
        'Employee Name',
        'Employee ID',
        'Product ID',
        'Product Name',
        'Product Type',
        'Brand',
        'Category',
        'Overall Quality Rating',
        'Product-Specific Rating',
        'Packaging Rating',
        'Price or Recommendation Rating',
        'Improvement Suggestion',
        'Average Rating',
      ],
    });
  }
  return sheet;
};

const normalizeAnswer = (answer) => {
  if (answer === undefined || answer === null) return '';
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
};

const findAnswer = (answers, predicate) => {
  const found = answers.find((item) => predicate(item.questionText || ''));
  return found ? normalizeAnswer(found.answer) : '';
};

const buildRow = (response) => {
  const answers = response.answers || [];
  const lower = (text) => String(text || '').toLowerCase();

  const overall = findAnswer(answers, (text) => /overall quality|overall rating|rate the overall/.test(lower(text)));
  const productSpecific = findAnswer(
    answers,
    (text) => /fresh|fragrance|texture|feel|smell|taste|how would you rate/.test(lower(text))
  );
  const packaging = findAnswer(answers, (text) => /packaging|hygienic|informative|attractive/.test(lower(text)));
  const priceOrRecommendation = findAnswer(
    answers,
    (text) => /recommend|price|recommendation|value for money|fair price/.test(lower(text))
  );
  const improvement = findAnswer(answers, (text) => /improvement|suggestion|suggestions/.test(lower(text)));

  const numericRatings = answers
    .map((item) => {
      const value = normalizeAnswer(item.answer);
      return Number.isFinite(Number(value)) ? Number(value) : null;
    })
    .filter((value) => value !== null);

  const averageRating = numericRatings.length
    ? (numericRatings.reduce((sum, value) => sum + value, 0) / numericRatings.length).toFixed(2)
    : '';

  return {
    Timestamp: response.createdAt?.toISOString?.() || new Date().toISOString(),
    'Employee Name': response.employeeName,
    'Employee ID': response.employeeId,
    'Product ID': response.productId,
    'Product Name': response.productName,
    'Product Type': response.productLineName,
    Brand: response.category,
    Category: response.category,
    'Overall Quality Rating': overall,
    'Product-Specific Rating': productSpecific,
    'Packaging Rating': packaging,
    'Price or Recommendation Rating': priceOrRecommendation,
    'Improvement Suggestion': improvement,
    'Average Rating': averageRating,
  };
};

export const appendSurveyToSheet = async (response) => {
  if (!isConfigured()) return false;

  try {
    const doc = await getDoc();
    const sheet = await ensureSheet(doc);
    const row = buildRow(response);
    await sheet.addRow(row);
    return true;
  } catch (err) {
    console.error('Google Sheets sync failed:', err.message);
    return false;
  }
};

export const exportAllResponsesToSheet = async (responses) => {
  if (!isConfigured()) {
    throw new Error('Google Sheets is not configured. See README for setup.');
  }

  try {
    const doc = await getDoc();
    let sheet = doc.sheetsByTitle['Survey Responses'];
    if (sheet) {
      await sheet.delete();
    }
    sheet = await ensureSheet(doc);

    // Use the same 14-column format as appendSurveyToSheet for consistency
    const rows = responses.map((r) => buildRow(r));

    if (rows.length) await sheet.addRows(rows);
    return rows.length;
  } catch (err) {
    console.error('Export all responses failed:', err.message);
    throw err;
  }
};

export const getSheetUrl = () =>
  isConfigured()
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
    : null;
