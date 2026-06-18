import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const surveyResponseSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productVariant: { type: String, required: true },
    productLineId: { type: String, required: true },
    productLineName: { type: String, required: true },
    category: { type: String, required: true },
    answers: [answerSchema],
    syncedToSheet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

surveyResponseSchema.index({ employeeId: 1, productId: 1 }, { unique: true });

export default mongoose.model('SurveyResponse', surveyResponseSchema);
