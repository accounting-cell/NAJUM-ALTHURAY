import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ fullScreen = true, text }) => {
  const { t } = useTranslation();

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{text || t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
