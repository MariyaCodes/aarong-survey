import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const isConfigured = () =>
  process.env.GOOGLE_SHEET_ID &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY;

const getDoc = async () => {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
  await doc.loadInfo();
  return doc;
};

const ensureSheet = async (doc) => {
  let sheet = doc.sheetsByTitle['Survey Responses'];
  if (!sheet) {
    sheet = await doc.addSheet({
      title: 'Survey Responses',
      headerValues: [
        'Timestamp',
        'Employee ID',
        'Employee Name',
        'Category',
        'Product Line',
        'Product Name',
        'Variant',
        'Product ID',
        'Question',
        'Answer',
      ],
    });
  }
  return sheet;
};

export const appendSurveyToSheet = async (response) => {
  if (!isConfigured()) return false;

  try {
    const doc = await getDoc();
    const sheet = await ensureSheet(doc);

    const rows = response.answers.map((a) => ({
      Timestamp: response.createdAt?.toISOString?.() || new Date().toISOString(),
      'Employee ID': response.employeeId,
      'Employee Name': response.employeeName,
      Category: response.category,
      'Product Line': response.productLineName,
      'Product Name': response.productName,
      Variant: response.productVariant,
      'Product ID': response.productId,
      Question: a.questionText,
      Answer: Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer),
    }));

    await sheet.addRows(rows);
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

  const doc = await getDoc();
  let sheet = doc.sheetsByTitle['Survey Responses'];
  if (sheet) {
    await sheet.delete();
  }
  sheet = await ensureSheet(doc);

  const rows = responses.flatMap((r) =>
    r.answers.map((a) => ({
      Timestamp: r.createdAt?.toISOString?.() || '',
      'Employee ID': r.employeeId,
      'Employee Name': r.employeeName,
      Category: r.category,
      'Product Line': r.productLineName,
      'Product Name': r.productName,
      Variant: r.productVariant,
      'Product ID': r.productId,
      Question: a.questionText,
      Answer: Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer),
    }))
  );

  if (rows.length) await sheet.addRows(rows);
  return rows.length;
};

export const getSheetUrl = () =>
  isConfigured()
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
    : null;
