import { useState } from 'react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import useToastStore from '../store/toastStore';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToastStore();

  const initiatePayment = async (productId, phoneNumber) => {
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENTS.INITIATE, {
        productId,
        phoneNumber,
      });

      showToast('Payment initiated! Check your phone to complete the transaction.', 'success');
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to initiate payment';
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (transactionId) => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.STATUS(transactionId));
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check payment status';
      return { success: false, error: message };
    }
  };

  const getUserTransactions = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.MY_TRANSACTIONS);
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load transactions';
      return { success: false, error: message };
    }
  };

  return {
    loading,
    initiatePayment,
    checkPaymentStatus,
    getUserTransactions,
  };
};