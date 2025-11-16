import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Plus size={20} />
          <span>{t('addUser')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-600">{t('fullName')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('email')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('role')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('status')}</th>
                <th className="text-left py-3 px-4 text-gray-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.fullName}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {t(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
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

export default Users;
