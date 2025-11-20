import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiCheck, FiX, FiShield, FiFileText, FiCreditCard } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

const SellerVerification = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    idFrontImage: null,
    idBackImage: null,
    businessLicense: null,
    additionalDocuments: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'seller') {
      showToast('Only sellers can access verification', 'error');
      navigate('/');
      return;
    }

    fetchVerificationStatus();
  }, [isAuthenticated, user, navigate]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.VERIFICATION_STATUS);
      setVerificationStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('idType', formData.idType);
      submitData.append('idNumber', formData.idNumber);

      if (formData.idFrontImage) {
        submitData.append('idFrontImage', formData.idFrontImage);
      }
      if (formData.idBackImage) {
        submitData.append('idBackImage', formData.idBackImage);
      }
      if (formData.businessLicense) {
        submitData.append('businessLicense', formData.businessLicense);
      }

      const response = await api.post(API_ENDPOINTS.VERIFICATION_SUBMIT, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Verification documents submitted successfully!', 'success');
      setVerificationStatus(response.data.data);
    } catch (error) {
      console.error('Error submitting verification:', error);
      showToast(error.response?.data?.message || 'Failed to submit verification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-100 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-light-50 dark:bg-dark-800 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <FiShield className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Seller Verification
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Get verified to build trust with buyers and increase your sales
            </p>
          </div>

          {/* Status Display */}
          {verificationStatus && verificationStatus.status !== 'not-submitted' && (
            <div className="mb-8 p-6 rounded-lg border-2 border-dashed border-light-300 dark:border-dark-600 bg-light-200 dark:bg-dark-900">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {verificationStatus.status === 'approved' ? (
                  <FiCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                ) : verificationStatus.status === 'rejected' ? (
                  <FiX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                ) : (
                  <FiFileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    Status: {verificationStatus.status}
                  </h3>
                  {verificationStatus.reviewNotes && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {verificationStatus.reviewNotes}
                    </p>
                  )}
                </div>
              </div>
              {verificationStatus.status === 'approved' && (
                <p className="text-emerald-600 dark:text-emerald-400 text-center font-medium">
                  ✓ You are a verified seller! Buyers can trust your listings.
                </p>
              )}
            </div>
          )}

          {/* Verification Form */}
          {(!verificationStatus || verificationStatus.status === 'not-submitted' || verificationStatus.status === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ID Type *
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select ID Type</option>
                    <option value="national-id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers-license">Driver's License</option>
                  </select>
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>

              {/* ID Front Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ID Front Image *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-light-300 dark:border-dark-600 border-dashed rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-light-200 dark:bg-dark-900">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label
                        htmlFor="idFrontImage"
                        className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none px-3 py-2"
                      >
                        <span>Upload ID front image</span>
                        <input
                          id="idFrontImage"
                          name="idFrontImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'idFrontImage')}
                          required
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG, JPG up to 10MB
                    </p>
                    {formData.idFrontImage && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {formData.idFrontImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ID Back Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ID Back Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-light-300 dark:border-dark-600 border-dashed rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-light-200 dark:bg-dark-900">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label
                        htmlFor="idBackImage"
                        className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none px-3 py-2"
                      >
                        <span>Upload ID back image (optional)</span>
                        <input
                          id="idBackImage"
                          name="idBackImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'idBackImage')}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG, JPG up to 10MB
                    </p>
                    {formData.idBackImage && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {formData.idBackImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Business License (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-light-300 dark:border-dark-600 border-dashed rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-light-200 dark:bg-dark-900">
                  <div className="space-y-1 text-center">
                    <FiCreditCard className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label
                        htmlFor="businessLicense"
                        className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none px-3 py-2"
                      >
                        <span>Upload business license</span>
                        <input
                          id="businessLicense"
                          name="businessLicense"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'businessLicense')}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    {formData.businessLicense && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {formData.businessLicense.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit for Verification'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Info Section */}
          <div className="mt-8 p-6 bg-light-200 dark:bg-dark-900 rounded-lg border border-light-300 dark:border-dark-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Why get verified?
            </h3>
            <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-sm">
              <li>• Build trust with buyers</li>
              <li>• Increase visibility of your listings</li>
              <li>• Higher chance of successful sales</li>
              <li>• Access to premium seller features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerVerification;