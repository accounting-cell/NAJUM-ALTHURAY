import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Handovers = () => {
  const { t } = useTranslation();
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      const response = await api.get('/handovers');
      setHandovers(response.data.data.handovers);
    } catch (error) {
      console.error('Failed to fetch handovers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('handovers')}</h1>
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Plus size={20} />
          <span>{t('createHandover')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-600">ID</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('fromEmployee')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('toEmployee')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('status')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {handovers.map((handover) => (
                <tr key={handover.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{handover.id}</td>
                  <td className="py-3 px-4">{handover.from_employee_name}</td>
                  <td className="py-3 px-4">{handover.to_employee_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      handover.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(handover.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(handover.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Handovers;
