import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startMetaSync,
  setSyncStatus,
  syncCompleted,
  syncFailed,
  setMetaLeads,
  setLoading,
  setError,
} from '@/redux/slices/metaIntegrationSlice';
import {
  syncMetaLeadsManuallyApi,
  getMetaSyncLogsApi,
} from '@/api/apiRoutes';
import { BiRefresh, BiCheckCircle, BiXCircle, BiTime } from 'react-icons/bi';

export default function MetaSyncStatus({ agentId }) {
  const dispatch = useDispatch();
  const {
    meta: { syncStatus, leads, logs },
    loading,
    error,
  } = useSelector((state) => state.metaIntegration);

  const [syncLogs, setSyncLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch sync logs
  const fetchSyncLogs = async (page = 1) => {
    try {
      const response = await getMetaSyncLogsApi({ page, per_page: 10 });
      setSyncLogs(response.data?.data || []);
      setTotalPages(response.data?.last_page || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching sync logs:', err);
    }
  };

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  // Refresh logs every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSyncLogs(currentPage);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const handleManualSync = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(startMetaSync());

      const response = await syncMetaLeadsManuallyApi();

      if (response.data) {
        dispatch(setMetaLeads(response.data.leads || []));
        dispatch(syncCompleted());
        dispatch(setSyncStatus({
          lastSync: new Date().toISOString(),
          totalSynced: response.data.leads?.length || 0,
        }));
        fetchSyncLogs(); // Refresh logs
      }
    } catch (err) {
      dispatch(syncFailed());
      dispatch(setError(err.response?.data?.message || 'Error al sincronizar leads'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return formatDate(dateString);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Estado de Sincronización</h2>
        <p className="text-sm text-gray-600 mt-1">Monitorea la sincronización de leads desde Meta</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sync Status Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase">Estado Actual</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {syncStatus.isSyncing ? 'Sincronizando...' : 'Listo'}
              </p>
            </div>
            {syncStatus.isSyncing ? (
              <BiTime className="text-4xl text-blue-600 animate-spin" />
            ) : (
              <BiCheckCircle className="text-4xl text-green-600" />
            )}
          </div>
        </div>

        {/* Total Synced Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div>
            <p className="text-sm text-green-600 font-semibold uppercase">Leads Sincronizados</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{syncStatus.totalSynced}</p>
            <p className="text-xs text-green-700 mt-2">Total en este mes</p>
          </div>
        </div>

        {/* Last Sync Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div>
            <p className="text-sm text-purple-600 font-semibold uppercase">Última Sincronización</p>
            <p className="text-lg font-bold text-purple-900 mt-2">
              {getRelativeTime(syncStatus.lastSync)}
            </p>
            <p className="text-xs text-purple-700 mt-2">{formatDate(syncStatus.lastSync)}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <BiXCircle className="text-red-600 text-2xl flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Manual Sync Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Sincronización Manual</h3>
            <p className="text-blue-100 text-sm mt-2">
              Ejecuta una sincronización inmediata de tus leads de Meta
            </p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={loading || syncStatus.isSyncing}
            className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <BiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sincronizando...' : 'Sincronizar Ahora'}
          </button>
        </div>
      </div>

      {/* Sync Configuration */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Sincronización</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Frecuencia de Sincronización</p>
              <p className="text-sm text-gray-600">Cada 5 minutos (automático)</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Activo
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Errores Detectados</p>
              <p className="text-sm text-gray-600">{syncStatus.errorCount} esta sesión</p>
            </div>
            {syncStatus.errorCount > 0 ? (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                {syncStatus.errorCount}
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Sin errores
              </span>
            )}
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-semibold text-gray-900">Próxima Sincronización</p>
              <p className="text-sm text-gray-600">Automática en ~5 minutos</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              En espera
            </span>
          </div>
        </div>
      </div>

      {/* Sync Logs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Historial de Sincronización
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {syncLogs.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No hay registros de sincronización</p>
            </div>
          ) : (
            syncLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {log.estado === 'completado' ? (
                      <BiCheckCircle className="text-green-600 text-xl" />
                    ) : (
                      <BiXCircle className="text-red-600 text-xl" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {log.estado === 'completado' ? 'Sincronización Exitosa' : 'Sincronización Fallida'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(log.fecha_inicio).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    log.estado === 'completado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.leads_sincronizados} leads
                  </span>
                </div>

                {log.error_message && (
                  <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                    Error: {log.error_message}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="text-gray-600">
                    <span className="font-semibold">Duración:</span> {log.duracion_segundos}s
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Procesados:</span> {log.leads_procesados}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Duplicados:</span> {log.duplicados}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => fetchSyncLogs(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-semibold disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => fetchSyncLogs(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-semibold disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Información</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>La sincronización automática se ejecuta cada 5 minutos</li>
          <li>Los leads duplicados se detectan automáticamente</li>
          <li>Cada sincronización se registra para auditoría</li>
          <li>Puedes sincronizar manualmente en cualquier momento</li>
        </ul>
      </div>
    </div>
  );
}
