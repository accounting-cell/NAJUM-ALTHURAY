import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import api from '../../utils/api';

const SettingsModal = ({ isOpen, onClose, settings, setSettings }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    appName: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    defaultLanguage: 'ar'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        primaryColor: settings.primaryColor || '#3b82f6',
        secondaryColor: settings.secondaryColor || '#8b5cf6',
        defaultLanguage: settings.defaultLanguage || 'ar'
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/settings', formData);
      const updatedSettings = response.data.data.settings;
      
      setSettings(updatedSettings);
      
      // Apply colors immediately
      document.documentElement.style.setProperty('--color-primary', updatedSettings.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', updatedSettings.secondaryColor);
      
      alert(t('updateSuccess'));
      onClose();
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('systemSettings')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('appNameLabel')}
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('primaryColor')}
            </label>
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('secondaryColor')}
            </label>
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('defaultLanguage')}
            </label>
            <select
              value={formData.defaultLanguage}
              onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="ar">{t('arabic')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
