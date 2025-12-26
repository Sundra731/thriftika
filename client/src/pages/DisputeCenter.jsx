import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Toast from '../components/Toast';
import useToastStore from '../store/toastStore';

const DisputeCenter = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    reason: '',
    description: '',
    evidence: [],
  });
  const [transactions, setTransactions] = useState([]);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    fetchDisputes();
    fetchTransactions();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await api.get('/disputes/my-disputes');
      setDisputes(response.data.data);
    } catch (error) {
      showToast('Failed to load disputes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/payments/my-transactions');
      // Filter transactions that can have disputes
      const disputableTransactions = response.data.data.filter(t =>
        ['in-escrow', 'shipped', 'delivered', 'delivery-confirmed'].includes(t.status)
      );
      setTransactions(disputableTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/disputes', formData);
      showToast('Dispute created successfully', 'success');
      setShowCreateForm(false);
      setFormData({ transactionId: '', reason: '', description: '', evidence: [] });
      fetchDisputes();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create dispute', 'error');
    }
  };

  const handleAddResponse = async (disputeId, response) => {
    try {
      await api.put(`/disputes/${disputeId}/response`, { response });
      showToast('Response added successfully', 'success');
      fetchDisputes();
    } catch (error) {
      showToast('Failed to add response', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading disputes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution Center</h1>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Create New Dispute
              </button>
            </div>
          </div>

          <div className="p-6">
            {disputes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No disputes found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  If you have issues with a transaction, you can create a dispute here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Dispute #{dispute._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Transaction: ${dispute.transaction?.amount || 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(dispute.priority)}`}>
                          {dispute.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reason</p>
                        <p className="text-sm text-gray-600">{dispute.reason.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-600">{dispute.description}</p>
                    </div>

                    {dispute.resolution && (
                      <div className="bg-green-50 p-4 rounded-md mb-4">
                        <p className="text-sm font-medium text-green-800">Resolution</p>
                        <p className="text-sm text-green-700">{dispute.resolution.replace('-', ' ')}</p>
                        {dispute.resolutionDetails && (
                          <p className="text-sm text-green-600 mt-1">{dispute.resolutionDetails}</p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Dispute Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Dispute</h3>
                <form onSubmit={handleCreateDispute}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Transaction</label>
                    <select
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    >
                      <option value="">Select a transaction</option>
                      {transactions.map((transaction) => (
                        <option key={transaction._id} value={transaction._id}>
                          Transaction #{transaction._id.slice(-8)} - ${transaction.amount} - {transaction.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="fake-item">Fake Item</option>
                      <option value="non-delivery">Non-delivery</option>
                      <option value="wrong-item">Wrong Item</option>
                      <option value="damaged-goods">Damaged Goods</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      rows="4"
                      placeholder="Please provide detailed information about the issue..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Create Dispute
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Details Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dispute Details #{selectedDispute._id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedDispute.status)}`}>
                      {selectedDispute.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason</p>
                    <p className="text-sm text-gray-600">{selectedDispute.reason.replace('-', ' ')}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600">{selectedDispute.description}</p>
                  </div>

                  {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Evidence</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedDispute.evidence.map((url, index) => (
                          <img key={index} src={url} alt={`Evidence ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDispute.buyerResponse && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-blue-800">Buyer Response</p>
                      <p className="text-sm text-blue-700">{selectedDispute.buyerResponse}</p>
                    </div>
                  )}

                  {selectedDispute.sellerResponse && (
                    <div className="bg-orange-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-orange-800">Seller Response</p>
                      <p className="text-sm text-orange-700">{selectedDispute.sellerResponse}</p>
                    </div>
                  )}

                  {selectedDispute.resolution && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-green-800">Resolution</p>
                      <p className="text-sm text-green-700">{selectedDispute.resolution.replace('-', ' ')}</p>
                      {selectedDispute.resolutionDetails && (
                        <p className="text-sm text-green-600 mt-1">{selectedDispute.resolutionDetails}</p>
                      )}
                    </div>
                  )}

                  {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                    <DisputeResponseForm
                      dispute={selectedDispute}
                      onSubmit={(response) => handleAddResponse(selectedDispute._id, response)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
};

const DisputeResponseForm = ({ dispute, onSubmit }) => {
  const [response, setResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response);
      setResponse('');
    }
  };

  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-medium text-gray-900 mb-2">Add Response</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
          rows="3"
          placeholder="Enter your response..."
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Submit Response
        </button>
      </form>
    </div>
  );
};

export default DisputeCenter;