import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';
import useToastStore from '../store/toastStore';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="h-5 w-5" />;
      case 'error':
        return <FiXCircle className="h-5 w-5" />;
      case 'info':
        return <FiInfo className="h-5 w-5" />;
      case 'warning':
        return <FiAlertCircle className="h-5 w-5" />;
      default:
        return <FiInfo className="h-5 w-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'info':
        return 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-secondary-50 dark:bg-accent-800 border-secondary-200 dark:border-accent-700 text-secondary-800 dark:text-accent-200';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-start space-x-3 animate-slide-in`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-secondary-400 dark:text-light-500 hover:text-secondary-600 dark:hover:text-light-300 transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;






