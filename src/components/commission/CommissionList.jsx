import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCommissionsApi } from '@/api/apiRoutes';
import { setCommissions, setCommissionsLoading, setCommissionError } from '@/redux/slices/commissionSlice';
import CommissionCard from './CommissionCard';
import { BiSearch } from 'react-icons/bi';
import { Spinner } from '@/components/ui/spinner';

const CommissionList = ({ onSelectCommission }) => {
  const dispatch = useDispatch();
  const { commissions, filters, pagination, loading } = useSelector(state => state.commissions);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, [filters, pagination.page]);

  const fetchCommissions = async () => {
    try {
      dispatch(setCommissionsLoading(true));
      const response = await getCommissionsApi({
        ...filters,
        search: searchTerm,
        page: pagination.page,
        per_page: pagination.per_page,
      });
      dispatch(setCommissions(response.data || response));
    } catch (error) {
      dispatch(setCommissionError(error.message || 'Error fetching commissions'));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    pagination.page = 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <BiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por propiedad o agente..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Commissions Grid */}
      {commissions?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commissions.map((commission) => (
            <CommissionCard
              key={commission.id}
              commission={commission}
              onViewDetails={onSelectCommission}
              onAction={(id, action) => {
                onSelectCommission(id, action);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay comisiones disponibles</p>
        </div>
      )}

      {/* Pagination */}
      {pagination?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {/* Previous Button */}
          <button
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          {/* Page Numbers */}
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-2 rounded ${
                pagination.page === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            disabled={pagination.page === pagination.last_page}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default CommissionList;
