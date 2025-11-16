import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Transactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [search]);

  const fetchTransactions = async () => {
    try {
      const params = search ? `?search=${search}` : '';
      const response = await api.get(`/transactions${params}`);
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('transactions')}</h1>
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Plus size={20} />
          <span>{t('newTransaction')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-600">{t('transactionNumber')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('clientName')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('serviceType')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('status')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{transaction.transaction_number}</td>
                  <td className="py-3 px-4">{transaction.client_name}</td>
                  <td className="py-3 px-4">{transaction.service_type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      transaction.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t(transaction.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
