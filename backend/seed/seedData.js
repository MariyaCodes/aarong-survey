import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Employee from '../models/Employee.js';
import Host from '../models/Host.js';
import ProductLine from '../models/ProductLine.js';
import Product from '../models/Product.js';

const defaultQuestions = (productType) => [
  {
    text: `How would you rate the overall quality of this ${productType}?`,
    type: 'rating',
    options: ['1', '2', '3', '4', '5'],
    order: 0,
  },
  {
    text: 'Is the packaging attractive and informative?',
    type: 'yesno',
    options: ['Yes', 'No'],
    order: 1,
  },
  {
    text: 'Which qualities did you notice? (tick all that apply)',
    type: 'checkbox',
    options: [
      'Pleasant fragrance',
      'Natural ingredients',
      'Good texture',
      'Effective results',
      'Value for money',
      'Eco-friendly packaging',
    ],
    order: 2,
  },
  {
    text: 'Would you recommend this product to customers?',
    type: 'yesno',
    options: ['Yes', 'No'],
    order: 3,
  },
  {
    text: 'Any improvement suggestions?',
    type: 'checkbox',
    options: [
      'Better pricing',
      'Larger size option',
      'Clearer label instructions',
      'Stronger fragrance',
      'Milder formula',
      'No changes needed',
    ],
    order: 4,
  },
];

const faceWashQuestions = defaultQuestions('face wash');
const faceMaskQuestions = defaultQuestions('face mask');
const bathingBarQuestions = defaultQuestions('bathing bar');
const bodyWashQuestions = defaultQuestions('body wash');
const hairPackQuestions = defaultQuestions('hair pack');
const dairyQuestions = [
  {
    text: 'How would you rate the freshness and taste?',
    type: 'rating',
    options: ['1', '2', '3', '4', '5'],
    order: 0,
  },
  {
    text: 'Is the packaging hygienic and easy to handle?',
    type: 'yesno',
    options: ['Yes', 'No'],
    order: 1,
  },
  {
    text: 'Which qualities did you notice? (tick all that apply)',
    type: 'checkbox',
    options: [
      'Fresh taste',
      'Rich texture',
      'Proper sealing',
      'Correct expiry labeling',
      'Fair price',
      'Good for family use',
    ],
    order: 2,
  },
  {
    text: 'Would you recommend this dairy product to customers?',
    type: 'yesno',
    options: ['Yes', 'No'],
    order: 3,
  },
  {
    text: 'Any improvement suggestions?',
    type: 'checkbox',
    options: [
      'Better cold chain display',
      'Smaller pack size',
      'Larger pack size',
      'Lower price',
      'More flavour options',
      'No changes needed',
    ],
    order: 4,
  },
];

const productLines = [
  {
    lineId: 'earth-face-wash',
    name: 'Face Wash',
    category: 'Aarong Earth',
    description: 'Herbal face washes with bursting beads — shared survey for all variants.',
    questions: faceWashQuestions,
  },
  {
    lineId: 'earth-face-mask',
    name: 'Face Mask',
    category: 'Aarong Earth',
    description: 'Natural face masks in 200ml jars.',
    questions: faceMaskQuestions,
  },
  {
    lineId: 'earth-face-pack',
    name: 'Face Pack',
    category: 'Aarong Earth',
    description: 'Traditional herbal face packs.',
    questions: defaultQuestions('face pack'),
  },
  {
    lineId: 'earth-bathing-bar',
    name: 'Bathing Bar',
    category: 'Aarong Earth',
    description: 'Handcrafted exfoliating bathing bars.',
    questions: bathingBarQuestions,
  },
  {
    lineId: 'earth-body-wash',
    name: 'Body Wash',
    category: 'Aarong Earth',
    description: 'Botanical body washes.',
    questions: bodyWashQuestions,
  },
  {
    lineId: 'earth-hair-pack',
    name: 'Hair Pack',
    category: 'Aarong Earth',
    description: 'Herbal hair treatment packs.',
    questions: hairPackQuestions,
  },
  {
    lineId: 'earth-shampoo',
    name: 'Shampoo',
    category: 'Aarong Earth',
    description: 'Natural shampoo range.',
    questions: defaultQuestions('shampoo'),
  },
  {
    lineId: 'earth-soothing-gel',
    name: 'Soothing Gel',
    category: 'Aarong Earth',
    description: 'Aloe vera soothing gel products.',
    questions: defaultQuestions('soothing gel'),
  },
  {
    lineId: 'earth-rose-water',
    name: 'Rose Water',
    category: 'Aarong Earth',
    description: 'Pure rose water toner.',
    questions: defaultQuestions('rose water'),
  },
  {
    lineId: 'earth-lip-balm',
    name: 'Lip Balm',
    category: 'Aarong Earth',
    description: 'Moisturizing lip care.',
    questions: defaultQuestions('lip balm'),
  },
  {
    lineId: 'dairy-milk',
    name: 'Fresh Milk',
    category: 'Aarong Dairy',
    description: 'Pasteurized and UHT milk products.',
    questions: dairyQuestions,
  },
  {
    lineId: 'dairy-yogurt',
    name: 'Yogurt & Curd',
    category: 'Aarong Dairy',
    description: 'Sweetened and sour yogurt variants.',
    questions: dairyQuestions,
  },
  {
    lineId: 'dairy-ghee-butter',
    name: 'Ghee & Butter',
    category: 'Aarong Dairy',
    description: 'Pure ghee and butter products.',
    questions: dairyQuestions,
  },
  {
    lineId: 'dairy-cheese',
    name: 'Cheese',
    category: 'Aarong Dairy',
    description: 'Cheese and cheese spread range.',
    questions: dairyQuestions,
  },
  {
    lineId: 'dairy-sweets',
    name: 'Traditional Sweets',
    category: 'Aarong Dairy',
    description: 'Aarong Dairy sweets including roshogolla.',
    questions: dairyQuestions,
  },
  {
    lineId: 'dairy-powder-drinks',
    name: 'Milk Powder & Drinks',
    category: 'Aarong Dairy',
    description: 'Milk powder and flavoured milk drinks.',
    questions: dairyQuestions,
  },
];

const products = [
  // Aarong Earth — Face Wash (shared questions)
  { productId: 'AE-FW-001', name: 'Aarong Earth Aloe Vera Face Wash', variant: 'Aloe Vera', productLineId: 'earth-face-wash', category: 'Aarong Earth', price: 200, unit: '100ml' },
  { productId: 'AE-FW-002', name: 'Aarong Earth Tulsi Face Wash With Bursting Beads', variant: 'Tulsi', productLineId: 'earth-face-wash', category: 'Aarong Earth', price: 200, unit: '100ml' },
  { productId: 'AE-FW-003', name: 'Aarong Earth Neem Face Wash With Bursting Beads', variant: 'Neem', productLineId: 'earth-face-wash', category: 'Aarong Earth', price: 200, unit: '100ml' },
  { productId: 'AE-FW-004', name: 'Aarong Earth Honey & Walnut 2-In-1 Face Wash & Scrub', variant: 'Honey & Walnut', productLineId: 'earth-face-wash', category: 'Aarong Earth', price: 200, unit: '100ml' },

  // Face Masks
  { productId: 'AE-FM-001', name: 'Aarong Earth Aloe Vera Face Mask', variant: 'Aloe Vera', productLineId: 'earth-face-mask', category: 'Aarong Earth', price: 250, unit: '200ml' },
  { productId: 'AE-FM-002', name: 'Aarong Earth Sandalwood Face Mask', variant: 'Sandalwood', productLineId: 'earth-face-mask', category: 'Aarong Earth', price: 250, unit: '200ml' },
  { productId: 'AE-FM-003', name: 'Aarong Earth Orange Peel Face Mask', variant: 'Orange Peel', productLineId: 'earth-face-mask', category: 'Aarong Earth', price: 250, unit: '200ml' },

  // Face Packs
  { productId: 'AE-FP-001', name: 'Aarong Earth Multani Face Pack', variant: 'Multani', productLineId: 'earth-face-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },
  { productId: 'AE-FP-002', name: 'Aarong Earth Herbal Face Pack', variant: 'Herbal', productLineId: 'earth-face-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },
  { productId: 'AE-FP-003', name: 'Aarong Earth Uptan Face Pack', variant: 'Uptan', productLineId: 'earth-face-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },
  { productId: 'AE-FP-004', name: 'Aarong Earth Neem Face Pack', variant: 'Neem', productLineId: 'earth-face-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },
  { productId: 'AE-FP-005', name: 'Aarong Earth Sandalwood Face Pack', variant: 'Sandalwood', productLineId: 'earth-face-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },

  // Bathing Bars
  { productId: 'AE-BB-001', name: 'Aarong Earth Neem Bathing Bar', variant: 'Neem', productLineId: 'earth-bathing-bar', category: 'Aarong Earth', price: 130, unit: '100gm' },
  { productId: 'AE-BB-002', name: 'Aarong Earth Orange Peel Exfoliating Bathing Bar', variant: 'Orange Peel', productLineId: 'earth-bathing-bar', category: 'Aarong Earth', price: 130, unit: '100gm' },
  { productId: 'AE-BB-003', name: 'Aarong Earth Goat Milk Bathing Bar', variant: 'Goat Milk', productLineId: 'earth-bathing-bar', category: 'Aarong Earth', price: 180, unit: '100gm' },
  { productId: 'AE-BB-004', name: 'Aarong Earth Turmeric Bathing Bar with Honey', variant: 'Turmeric & Honey', productLineId: 'earth-bathing-bar', category: 'Aarong Earth', price: 130, unit: '100gm' },
  { productId: 'AE-BB-005', name: 'Aarong Earth Oatmeal Exfoliating Bathing Bar', variant: 'Oatmeal', productLineId: 'earth-bathing-bar', category: 'Aarong Earth', price: 130, unit: '100gm' },

  // Body Wash
  { productId: 'AE-BW-001', name: 'Aarong Earth Neem Body Wash', variant: 'Neem', productLineId: 'earth-body-wash', category: 'Aarong Earth', price: 350, unit: '380ml' },
  { productId: 'AE-BW-002', name: 'Aarong Earth Honey Body Wash', variant: 'Honey', productLineId: 'earth-body-wash', category: 'Aarong Earth', price: 350, unit: '380ml' },
  { productId: 'AE-BW-003', name: 'Aarong Earth Aloe Vera Body Wash', variant: 'Aloe Vera', productLineId: 'earth-body-wash', category: 'Aarong Earth', price: 350, unit: '380ml' },

  // Hair Packs
  { productId: 'AE-HP-001', name: 'Aarong Earth Mehndi Hair Pack', variant: 'Mehndi', productLineId: 'earth-hair-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },
  { productId: 'AE-HP-002', name: 'Aarong Earth Herbal Hair Pack with Sesame Oil', variant: 'Herbal Sesame', productLineId: 'earth-hair-pack', category: 'Aarong Earth', price: 120, unit: '100gm' },

  // Other Earth
  { productId: 'AE-SH-001', name: 'Aarong Earth Shampoo', variant: 'Regular', productLineId: 'earth-shampoo', category: 'Aarong Earth', price: 250, unit: '200ml' },
  { productId: 'AE-SG-001', name: 'Aarong Earth Aloe Vera Soothing Gel', variant: '100ml', productLineId: 'earth-soothing-gel', category: 'Aarong Earth', price: 250, unit: '100ml' },
  { productId: 'AE-SG-002', name: 'Aarong Earth Aloe Vera Soothing Gel', variant: '200ml', productLineId: 'earth-soothing-gel', category: 'Aarong Earth', price: 400, unit: '200ml' },
  { productId: 'AE-RW-001', name: 'Aarong Earth Rose Water', variant: 'Classic', productLineId: 'earth-rose-water', category: 'Aarong Earth', price: 150, unit: '120ml' },
  { productId: 'AE-LB-001', name: 'Aarong Earth Aloe Vera Lip Balm', variant: 'Aloe Vera', productLineId: 'earth-lip-balm', category: 'Aarong Earth', price: 220, unit: '15ml' },

  // Aarong Dairy — Milk
  { productId: 'AD-MK-001', name: 'Aarong Dairy Pasteurized Liquid Milk', variant: 'Full Cream 1L', productLineId: 'dairy-milk', category: 'Aarong Dairy', price: 105, unit: '1 ltr' },
  { productId: 'AD-MK-002', name: 'Aarong Dairy UHT Milk', variant: 'UHT 500ml', productLineId: 'dairy-milk', category: 'Aarong Dairy', price: 60, unit: '500ml' },
  { productId: 'AD-MK-003', name: 'Aarong Dairy Chocolate Milk Drink UHT', variant: 'Chocolate', productLineId: 'dairy-milk', category: 'Aarong Dairy', price: 35, unit: '200ml' },

  // Yogurt
  { productId: 'AD-YG-001', name: 'Aarong Dairy Sweetened Yogurt', variant: 'Sweetened', productLineId: 'dairy-yogurt', category: 'Aarong Dairy', price: 150, unit: '500gm' },
  { productId: 'AD-YG-002', name: 'Aarong Dairy Low Fat Yogurt (Sour)', variant: 'Low Fat Sour', productLineId: 'dairy-yogurt', category: 'Aarong Dairy', price: 110, unit: '500gm' },
  { productId: 'AD-YG-003', name: 'Aarong Dairy Sour Curd', variant: 'Sour Curd', productLineId: 'dairy-yogurt', category: 'Aarong Dairy', price: 120, unit: '500gm' },

  // Ghee & Butter
  { productId: 'AD-GB-001', name: 'Aarong Dairy Pure Ghee', variant: '200gm', productLineId: 'dairy-ghee-butter', category: 'Aarong Dairy', price: 390, unit: '200gm' },
  { productId: 'AD-GB-002', name: 'Aarong Dairy Pure Ghee', variant: '450gm', productLineId: 'dairy-ghee-butter', category: 'Aarong Dairy', price: 825, unit: '450gm' },
  { productId: 'AD-GB-003', name: 'Aarong Dairy Butter', variant: 'Salted', productLineId: 'dairy-ghee-butter', category: 'Aarong Dairy', price: 270, unit: '200gm' },

  // Cheese
  { productId: 'AD-CH-001', name: 'Aarong Dairy Austagram Cheese', variant: 'Austagram', productLineId: 'dairy-cheese', category: 'Aarong Dairy', price: 190, unit: '200gm' },
  { productId: 'AD-CH-002', name: 'Aarong Dairy Cheese Spread Classic', variant: 'Classic', productLineId: 'dairy-cheese', category: 'Aarong Dairy', price: 290, unit: '180gm' },
  { productId: 'AD-CH-003', name: 'Aarong Dairy Cheese Spread Garlic', variant: 'Garlic', productLineId: 'dairy-cheese', category: 'Aarong Dairy', price: 300, unit: '180gm' },
  { productId: 'AD-CH-004', name: 'Aarong Dairy Cheese Spread Pizza', variant: 'Pizza', productLineId: 'dairy-cheese', category: 'Aarong Dairy', price: 260, unit: '180gm' },

  // Sweets
  { productId: 'AD-SW-001', name: 'Aarong Dairy Roshogolla', variant: '1kg Box', productLineId: 'dairy-sweets', category: 'Aarong Dairy', price: 350, unit: '1 kg' },

  // Powder & Drinks
  { productId: 'AD-PD-001', name: 'Aarong Dairy Full Cream Milk Powder', variant: 'Full Cream', productLineId: 'dairy-powder-drinks', category: 'Aarong Dairy', price: 460, unit: '500gm' },
];

const employees = [
  { employeeId: 'EMP001', name: 'Rahim Uddin', pin: '1234', department: 'Retail' },
  { employeeId: 'EMP002', name: 'Fatima Begum', pin: '1234', department: 'Quality' },
  { employeeId: 'EMP003', name: 'Karim Hassan', pin: '1234', department: 'Warehouse' },
  { employeeId: 'EMP004', name: 'Nusrat Jahan', pin: '1234', department: 'Sales' },
  { employeeId: 'EMP005', name: 'Saiful Islam', pin: '1234', department: 'Production' },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Employee.deleteMany({}),
    Host.deleteMany({}),
    ProductLine.deleteMany({}),
    Product.deleteMany({}),
    mongoose.connection.collection('surveyresponses').deleteMany({}).catch(() => {}),
  ]);

  console.log('Seeding product lines...');
  await ProductLine.insertMany(productLines);

  console.log('Seeding products...');
  await Product.insertMany(products);

  console.log('Seeding employees...');
  for (const emp of employees) {
    await Employee.create({
      ...emp,
      pin: await bcrypt.hash(emp.pin, 10),
    });
  }

  console.log('Seeding host...');
  await Host.create({
    username: 'host',
    name: 'Survey Host',
    password: await bcrypt.hash('admin123', 10),
  });

  console.log('\n✅ Seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Employee: EMP001 / PIN 1234');
  console.log('  Host: host / admin123');
  console.log(`\n  Products: ${products.length}`);
  console.log(`  Product lines: ${productLines.length}`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
