import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import useToastStore from '../store/toastStore';

const TrackingComponent = ({ transactionId, isSeller = false }) => {
  const { user } = useAuth();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    courierName: '',
    courierTrackingUrl: '',
  });
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    description: '',
    location: '',
  });
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    fetchTrackingInfo();
    fetchCouriers();
  }, [transactionId]);

  const fetchTrackingInfo = async () => {
    try {
      const response = await api.get(`/tracking/${transactionId}`);
      setTrackingInfo(response.data.data);
      // Pre-fill form data
      setFormData({
        trackingNumber: response.data.data.trackingNumber || '',
        courierName: response.data.data.courierName || '',
        courierTrackingUrl: response.data.data.courierTrackingUrl || '',
      });
    } catch (error) {
      console.error('Failed to fetch tracking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await api.get('/tracking/couriers');
      setCouriers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch couriers:', error);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tracking/${transactionId}`, formData);
      showToast('Tracking information updated successfully', 'success');
      setShowUpdateForm(false);
      fetchTrackingInfo();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update tracking', 'error');
    }
  };

  const handleAddTrackingUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tracking/${transactionId}/update`, updateFormData);
      showToast('Tracking update added successfully', 'success');
      setUpdateFormData({ status: '', description: '', location: '' });
      fetchTrackingInfo();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add tracking update', 'error');
    }
  };

  const getCourierLabel = (courierValue) => {
    const courier = couriers.find(c => c.value === courierValue);
    return courier ? courier.label : courierValue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'order-placed': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed-delivery': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingUrl = () => {
    if (!trackingInfo?.trackingNumber || !trackingInfo?.courierName) return null;

    const courier = couriers.find(c => c.value === trackingInfo.courierName);
    if (courier && courier.trackingUrl) {
      return courier.trackingUrl.replace('{trackingNumber}', trackingInfo.trackingNumber);
    }

    if (trackingInfo.courierTrackingUrl) {
      return trackingInfo.courierTrackingUrl.replace('{trackingNumber}', trackingInfo.trackingNumber);
    }

    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Order Tracking</h3>
        {isSeller && (
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showUpdateForm ? 'Cancel' : 'Update Tracking'}
          </button>
        )}
      </div>

      {trackingInfo ? (
        <div className="space-y-6">
          {/* Tracking Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Tracking Number</p>
              <p className="text-sm text-gray-600">
                {trackingInfo.trackingNumber || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Courier</p>
              <p className="text-sm text-gray-600">
                {trackingInfo.courierName ? getCourierLabel(trackingInfo.courierName) : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Current Status</p>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(trackingInfo.currentStatus)}`}>
                {trackingInfo.currentStatus.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Tracking Link */}
          {getTrackingUrl() && (
            <div>
              <a
                href={getTrackingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Track Package
              </a>
            </div>
          )}

          {/* Tracking Updates */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Tracking Updates</h4>
            {trackingInfo.updates && trackingInfo.updates.length > 0 ? (
              <div className="space-y-4">
                {trackingInfo.updates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(update.status)}`}>
                        <span className="text-xs font-medium">
                          {update.status === 'delivered' ? '✓' :
                           update.status === 'shipped' ? '📦' :
                           update.status === 'in-transit' ? '🚚' : '📍'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(update.status)}`}>
                          {update.status.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mt-1">{update.description}</p>
                      {update.location && (
                        <p className="text-sm text-gray-600">Location: {update.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tracking updates yet.</p>
            )}
          </div>

          {/* Add Tracking Update (Seller Only) */}
          {isSeller && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add Tracking Update</h4>
              <form onSubmit={handleAddTrackingUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="in-transit">In Transit</option>
                    <option value="out-for-delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed-delivery">Failed Delivery</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={updateFormData.description}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., Package picked up by courier"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                  <input
                    type="text"
                    value={updateFormData.location}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, location: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g., Nairobi Distribution Center"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Update
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">No tracking information available.</p>
      )}

      {/* Update Tracking Form (Seller Only) */}
      {showUpdateForm && isSeller && (
        <div className="border-t pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Update Tracking Information</h4>
          <form onSubmit={handleUpdateTracking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Courier</label>
              <select
                value={formData.courierName}
                onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Select courier</option>
                {couriers.map((courier) => (
                  <option key={courier.value} value={courier.value}>
                    {courier.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Tracking URL (Optional)</label>
              <input
                type="url"
                value={formData.courierTrackingUrl}
                onChange={(e) => setFormData({ ...formData, courierTrackingUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="https://example.com/track/{trackingNumber}"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Update Tracking
              </button>
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrackingComponent;