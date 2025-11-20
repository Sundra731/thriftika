// M-Pesa Daraja API Integration
import axios from 'axios';

// M-Pesa API Configuration
const MPESA_CONFIG = {
  baseURL: process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke',
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
};

// Generate M-Pesa access token
export const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');

    const response = await axios.get(`${MPESA_CONFIG.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Generate password for STK Push
export const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Initiate STK Push (Customer Pay Bill)
export const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDesc = 'Thriftika Purchase') => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    // Format phone number (remove + and ensure it starts with 254)
    const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');

    const payload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackURL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const response = await axios.post(`${MPESA_CONFIG.baseURL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw new Error('Failed to initiate payment');
  }
};

// Query STK Push payment status
export const querySTKPushStatus = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(`${MPESA_CONFIG.baseURL}/mpesa/stkpushquery/v1/query`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error querying STK Push status:', error);
    throw new Error('Failed to check payment status');
  }
};

// Process M-Pesa callback
export const processCallback = (callbackData) => {
  try {
    const { Body } = callbackData;

    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
      const transactionData = {};

      callbackMetadata.forEach(item => {
        switch (item.Name) {
          case 'Amount':
            transactionData.amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            transactionData.receiptNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionData.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            transactionData.phoneNumber = item.Value;
            break;
        }
      });

      return {
        success: true,
        resultCode: Body.stkCallback.ResultCode,
        resultDesc: Body.stkCallback.ResultDesc,
        ...transactionData,
      };
    } else {
      // Payment failed
      return {
        success: false,
        resultCode: Body.stkCallback.ResultCode,
        resultDesc: Body.stkCallback.ResultDesc,
      };
    }
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return { success: false, error: 'Callback processing failed' };
  }
};

// Format phone number for M-Pesa
export const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }

  return cleaned;
};

// Validate phone number
export const validatePhoneNumber = (phoneNumber) => {
  const formatted = formatPhoneNumber(phoneNumber);
  // Kenyan phone numbers should be 12 digits starting with 254
  return /^254[0-9]{9}$/.test(formatted);
};