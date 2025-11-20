import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { API_ENDPOINTS, REPORT_REASONS } from '../utils/constants';
import useToastStore from '../store/toastStore';

const ReportSeller = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportedSeller: searchParams.get('seller') || '',
    transaction: searchParams.get('transaction') || '',
    reason: '',
    description: '',
    evidence: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to report a seller', 'warning');
      navigate('/login');
    } else if (user?.role !== 'buyer') {
      showToast('Only buyers can report sellers', 'error');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, showToast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reportedSeller) {
      showToast('Please select a seller to report', 'error');
      return;
    }

    if (!formData.reason || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        ...formData,
        evidence: formData.evidence ? formData.evidence.split(',').map((url) => url.trim()) : [],
      };

      await api.post(API_ENDPOINTS.REPORTS.CREATE, reportData);
      showToast('Report submitted successfully. Our team will review it shortly.', 'success');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit report';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'buyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report a Seller</h1>
              <p className="text-gray-600 mt-1">
                Help us keep Thriftika safe by reporting suspicious activity
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reportedSeller" className="block text-sm font-medium text-gray-700 mb-2">
                Seller ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reportedSeller"
                name="reportedSeller"
                value={formData.reportedSeller}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Seller ID (auto-filled if coming from product page)"
              />
              <p className="mt-1 text-xs text-gray-500">
                The ID of the seller you want to report
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Report <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="input-field"
                placeholder="Please provide a detailed description of the issue..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Be as specific as possible. Include dates, transaction details, and any relevant information.
              </p>
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-2">
                Evidence (Optional)
              </label>
              <input
                type="text"
                id="evidence"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                className="input-field"
                placeholder="Comma-separated URLs to screenshots or images"
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide links to screenshots, images, or documents that support your report
              </p>
            </div>

            <div>
              <label htmlFor="transaction" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                id="transaction"
                name="transaction"
                value={formData.transaction}
                onChange={handleChange}
                className="input-field"
                placeholder="Transaction ID if applicable"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> False reports may result in account suspension. 
                Please only report genuine issues.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportSeller;




