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

const buildRow = (response) => {
  const answerMap = {
    overall: response.answers[0]?.answer ?? '',
    productSpecific: response.answers[1]?.answer ?? '',
    packaging: response.answers[2]?.answer ?? '',
    priceOrRecommend: response.answers[3]?.answer ?? '',
    improvement: response.answers[4]?.answer ?? '',
  };

  const averageRating = [
    Number(response.answers[0]?.answer) || 0,
    Number(response.answers[1]?.answer) || 0,
    Number(response.answers[3]?.answer) || 0,
  ]
    .filter((value) => value > 0)
    .reduce((sum, value) => sum + value, 0);

  const ratingCount = [
    response.answers[0]?.answer,
    response.answers[1]?.answer,
    response.answers[3]?.answer,
  ].filter((value) => typeof value === 'string' && value.trim() !== '').length;

  return {
    Timestamp: response.createdAt?.toISOString?.() || new Date().toISOString(),
    'Employee Name': response.employeeName,
    'Employee ID': response.employeeId,
    'Product ID': response.productId,
    'Product Name': response.productName,
    'Product Type': response.productLineName,
    Brand: response.category,
    Category: response.category,
    'Overall Quality Rating': answerMap.overall,
    'Product-Specific Rating': answerMap.productSpecific,
    'Packaging Rating': answerMap.packaging,
    'Price or Recommendation Rating': answerMap.priceOrRecommend,
    'Improvement Suggestion': Array.isArray(answerMap.improvement)
      ? answerMap.improvement.join(', ')
      : answerMap.improvement,
    'Average Rating': ratingCount ? (averageRating / ratingCount).toFixed(2) : '',
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
    console.error('Google Sheets sync failed:', err.message || err);
    return false;
  }
};

export const getSheetUrl = () =>
  isConfigured()
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
    : null;
