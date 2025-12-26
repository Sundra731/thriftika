import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import useToastStore from '../store/toastStore';

const TwoFactorSettings = () => {
  const { user } = useAuth();
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('email');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get('/2fa/status');
      setTwoFactorStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    setSetupLoading(true);
    try {
      const response = await api.post('/2fa/setup', { method: selectedMethod });
      setSetupData(response.data.data);

      if (selectedMethod === 'email') {
        showToast('Verification code sent to your email', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to setup 2FA', 'error');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    setVerifyLoading(true);
    try {
      const response = await api.post('/2fa/verify-setup', { code: verificationCode });

      if (response.data.data?.backupCodes) {
        setBackupCodes(response.data.data.backupCodes);
        setShowBackupCodes(true);
      }

      showToast('2FA enabled successfully!', 'success');
      setSetupData(null);
      setVerificationCode('');
      fetchTwoFactorStatus();
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid verification code', 'error');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      await api.delete('/2fa/disable');
      showToast('2FA disabled successfully', 'success');
      fetchTwoFactorStatus();
    } catch (error) {
      showToast('Failed to disable 2FA', 'error');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const response = await api.post('/2fa/regenerate-backup-codes');
      setBackupCodes(response.data.data.backupCodes);
      setShowBackupCodes(true);
      showToast('Backup codes regenerated', 'success');
    } catch (error) {
      showToast('Failed to regenerate backup codes', 'error');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    showToast('Backup codes copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication (2FA)</h3>
        <p className="text-sm text-gray-600">
          Add an extra layer of security to your account by enabling 2FA.
        </p>
      </div>

      {twoFactorStatus?.enabled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800">2FA is enabled</p>
              <p className="text-sm text-green-600">
                Method: {twoFactorStatus.method}
              </p>
            </div>
            <button
              onClick={handleDisableTwoFactor}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
            >
              Disable 2FA
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Backup Codes</h4>
            <p className="text-sm text-gray-600 mb-4">
              Backup codes can be used to access your account if you lose your 2FA device.
              Keep them in a safe place.
            </p>

            {showBackupCodes ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-gray-800">{code}</div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={copyBackupCodes}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Copy Codes
                  </button>
                  <button
                    onClick={() => setShowBackupCodes(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Hide Codes
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRegenerateBackupCodes}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                View Backup Codes
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!setupData ? (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Enable 2FA</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose your 2FA method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={selectedMethod === 'email'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Email - Receive codes via email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="authenticator"
                        checked={selectedMethod === 'authenticator'}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Authenticator App - Use Google Authenticator or similar</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSetupTwoFactor}
                  disabled={setupLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {setupLoading ? 'Setting up...' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {selectedMethod === 'authenticator' ? 'Setup Authenticator App' : 'Verify Email'}
              </h4>

              {selectedMethod === 'authenticator' && setupData.qrCodeUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code with your authenticator app:
                  </p>
                  <img
                    src={setupData.qrCodeUrl}
                    alt="QR Code for 2FA setup"
                    className="mx-auto border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Or enter this code manually: {setupData.secret}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    maxLength="6"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleVerifySetup}
                    disabled={verifyLoading || verificationCode.length !== 6}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    onClick={() => {
                      setSetupData(null);
                      setVerificationCode('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Why enable 2FA?</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Protects against account hacking</li>
          <li>• Prevents fake accounts and scams</li>
          <li>• Adds extra security for sellers</li>
          <li>• Required for high-value transactions</li>
        </ul>
      </div>
    </div>
  );
};

export default TwoFactorSettings;