import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function QuestionInput({ question, value, onChange }) {
  if (question.type === 'rating') {
    return (
      <div className="rating-options">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`rating-btn ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'yesno') {
    return (
      <div className="options-list">
        {question.options.map((opt) => (
          <label key={opt} className={`option-item ${value === opt ? 'selected' : ''}`}>
            <input
              type="radio"
              name={`question-${question.order}`}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  const selected = Array.isArray(value) ? value : [];
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((v) => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="options-list">
      {question.options.map((opt) => (
        <label key={opt} className={`option-item ${selected.includes(opt) ? 'selected' : ''}`}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function SurveyPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getMySurveys()])
      .then(([prods, surveys]) => {
        setProducts(prods);
        setCompletedIds(new Set(surveys.map((s) => s.productId)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const openSurvey = async (product) => {
    setError('');
    setSuccess('');
    setSelectedProduct(product);
    setAnswers({});
    try {
      const data = await api.getProductSurvey(product.productId);
      setSurveyData(data);
      if (data.alreadySubmitted) {
        setSuccess('You have already completed this product survey.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const setAnswer = (questionId, questionText, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, questionText, answer: value },
    }));
  };

  const submitSurvey = async (e) => {
    e.preventDefault();
    if (!surveyData || surveyData.alreadySubmitted) return;

    const answerList = Object.values(answers);
    if (answerList.length < surveyData.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.submitSurvey({
        productId: selectedProduct.productId,
        answers: answerList,
      });
      setSuccess('Survey submitted successfully! Thank you for your feedback.');
      setCompletedIds((prev) => new Set([...prev, selectedProduct.productId]));
      setSurveyData((d) => ({ ...d, alreadySubmitted: true }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Aarong Earth', 'Aarong Dairy'];
  const filtered =
    filter === 'All' ? products : products.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        Loading products...
      </div>
    );
  }

  if (selectedProduct && surveyData) {
    return (
      <div>
        <div className="survey-header">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedProduct(null)}>
            ← Back to Products
          </button>
          <h2 style={{ marginTop: '1rem' }}>{selectedProduct.name}</h2>
          <p style={{ color: 'var(--green-mid)', fontWeight: 600 }}>
            Variant: {selectedProduct.variant} · {selectedProduct.category}
          </p>
        </div>

        <div className="container" style={{ maxWidth: 720 }}>
          <div className="survey-info">{surveyData.sharedQuestionsNote}</div>
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {!surveyData.alreadySubmitted && (
            <form onSubmit={submitSurvey} className="card">
              {surveyData.questions.map((q, i) => (
                <div key={q.order ?? i} className="question-block">
                  <p className="question-text">
                    {i + 1}. {q.text}
                  </p>
                  <QuestionInput
                    question={q}
                    value={answers[q.order]?.answer ?? (q.type === 'checkbox' ? [] : '')}
                    onChange={(val) => setAnswer(q.order ?? i, q.text, val)}
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">Product Survey</h2>
      <p className="section-subtitle">
        Select a product to answer its survey. Each variant must be submitted separately, but
        questions are shared within the same product line.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filtered.map((product) => (
          <div
            key={product.productId}
            className={`card product-card ${completedIds.has(product.productId) ? 'done' : ''}`}
            onClick={() => openSurvey(product)}
            onKeyDown={(e) => e.key === 'Enter' && openSurvey(product)}
            role="button"
            tabIndex={0}
          >
            <div className="product-category">{product.category}</div>
            <div className="product-name">{product.name}</div>
            <div className="product-variant">Flavour: {product.variant}</div>
            <div className="product-meta">
              ৳{product.price} · {product.unit}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products in this category.</p>
      )}
    </div>
  );
}
