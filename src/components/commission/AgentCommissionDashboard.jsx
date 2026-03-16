import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAgentCommissionDashboardApi } from '@/api/apiRoutes';
import { setDashboardData, setCommissionsLoading } from '@/redux/slices/commissionSlice';
import { formatCurrency } from '@/utils/helperFunction';
import { HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { Spinner } from '@/components/ui/spinner';

const AgentCommissionDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, loading } = useSelector(state => state.commissions);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      dispatch(setCommissionsLoading(true));
      const response = await getAgentCommissionDashboardApi();
      dispatch(setDashboardData(response.data || response));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      dispatch(setCommissionsLoading(false));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Comisiones</h1>
        <p className="text-gray-600">Resumen de tu actividad de comisiones</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendiente"
          value={formatCurrency(dashboardData?.total_pending_amount || 0)}
          icon={HiOutlineBriefcase}
          color="text-orange-600"
          subtext={`${dashboardData?.total_pending || 0} comisiones`}
        />
        <StatCard
          title="Aprobadas"
          value={dashboardData?.total_approved || 0}
          icon={HiOutlineCheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="Rechazadas"
          value={dashboardData?.total_rejected || 0}
          icon={HiOutlineXCircle}
          color="text-red-600"
        />
        <StatCard
          title="Total Pagado"
          value={formatCurrency(dashboardData?.total_paid || 0)}
          icon={HiOutlineBriefcase}
          color="text-blue-600"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Commission */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-900 font-semibold text-sm">Comisiones Pendientes</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {dashboardData?.total_pending || 0}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Monto: {formatCurrency(dashboardData?.total_pending_amount || 0)}
              </p>
            </div>
            <div className="text-4xl text-orange-300 opacity-50">⏳</div>
          </div>
        </div>

        {/* Overdue Commissions */}
        {dashboardData?.overdue_count > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-900 font-semibold text-sm">Comisiones Vencidas ⚠️</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {dashboardData?.overdue_count}
                </p>
                <p className="text-sm text-red-700 mt-1">Requieren atención urgente</p>
              </div>
              <div className="text-4xl text-red-300 opacity-50">🚨</div>
            </div>
          </div>
        )}

        {/* Commission by Status */}
        {dashboardData?.leads_by_status && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-blue-900 font-semibold text-sm mb-3">Estado de Comisiones</p>
            <div className="space-y-2">
              {Object.entries(dashboardData.leads_by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="text-blue-900 capitalize">{status}:</span>
                  <span className="font-semibold text-blue-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commission Performance */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <p className="text-green-900 font-semibold text-sm mb-3">Desempeño</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-900">Aprobadas:</span>
              <span className="font-semibold text-green-700">
                {dashboardData?.total_approved || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-900">Total Pagado:</span>
              <span className="font-semibold text-green-700">
                {formatCurrency(dashboardData?.total_paid || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-900">Tasa de Conversión:</span>
              <span className="font-semibold text-green-700">
                {dashboardData?.total_pending > 0 
                  ? ((dashboardData?.total_approved / (dashboardData?.total_approved + dashboardData?.total_pending)) * 100).toFixed(1)
                  : '0'
                }%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
            Ver Todas las Comisiones
          </button>
          <button className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors">
            Crear Comisión
          </button>
          <button className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-medium transition-colors">
            Ver Vencidas
          </button>
          <button className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Refresh Info */}
      <div className="text-xs text-gray-500 text-center">
        Datos actualizados automáticamente cada 5 minutos
      </div>
    </div>
  );
};

export default AgentCommissionDashboard;
