import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats (admin/supervisor only)
      if (user.role !== 'employee') {
        const statsRes = await api.get('/transactions/stats/summary');
        setStats(statsRes.data.data);
      }

      // Fetch recent transactions
      const transRes = await api.get('/transactions?limit=10');
      setRecentTransactions(transRes.data.data.transactions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = stats ? [
    { title: t('totalTransactions'), value: stats.total, icon: FileText, color: 'blue' },
    { title: t('pendingTransactions'), value: stats.pending, icon: Clock, color: 'yellow' },
    { title: t('inProgress'), value: stats.in_progress, icon: TrendingUp, color: 'purple' },
    { title: t('completedTransactions'), value: stats.delivered, icon: CheckCircle, color: 'green' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-600 mt-2">{t('welcome')}, {user.fullName}</p>
      </div>

      {/* Stats Cards */}
      {user.role !== 'employee' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-${stat.color}-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <Icon className="text-${stat.color}-500" size={40} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('recentTransactions')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">{t('transactionNumber')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('clientName')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('serviceType')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
