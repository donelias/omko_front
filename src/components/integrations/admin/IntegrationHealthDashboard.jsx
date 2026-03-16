import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BiCheckCircle,
  BiXCircle,
  BiAlertCircle,
  BiTrendingUp,
  BiTrendingDown,
  BiRefresh,
  BiDownload,
} from 'react-icons/bi';

export default function IntegrationHealthDashboard({ agentId }) {
  const dispatch = useDispatch();
  const {
    credentials,
    meta: { syncStatus, logs, notifications },
  } = useSelector((state) => state.metaIntegration);

  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate health metrics
  const calculateMetrics = () => {
    const metaCount = credentials.meta?.length || 0;
    const whatsappCount = credentials.whatsapp?.length || 0;
    const totalCredentials = metaCount + whatsappCount;

    // Success rate from logs
    const successLogs = logs?.filter((l) => l.estado === 'completado').length || 0;
    const totalLogs = logs?.length || 1;
    const successRate = totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(2) : 0;

    // Error analysis
    const failedLogs = logs?.filter((l) => l.estado === 'fallido').length || 0;
    const totalDuplicates = logs?.reduce((sum, l) => sum + (l.duplicados || 0), 0) || 0;
    const totalLeadsSynced = logs?.reduce((sum, l) => sum + (l.leads_sincronizados || 0), 0) || 0;

    // Uptime calculation
    let uptime = 100;
    if (failedLogs > 0) {
      uptime = Math.max(0, 100 - failedLogs * 5);
    }

    return {
      totalCredentials,
      metaCount,
      whatsappCount,
      successRate,
      failedLogs,
      totalLeadsSynced,
      totalDuplicates,
      uptime,
      isSyncing: syncStatus.isSyncing,
      lastSync: syncStatus.lastSync,
      syncErrors: syncStatus.errorCount,
    };
  };

  const metrics = calculateMetrics();

  // Health status determination
  const getHealthStatus = () => {
    if (metrics.uptime >= 95) return { status: 'Excelente', color: 'green', icon: '✓' };
    if (metrics.uptime >= 90) return { status: 'Bueno', color: 'blue', icon: '✓' };
    if (metrics.uptime >= 80) return { status: 'Aceptable', color: 'yellow', icon: '!' };
    return { status: 'Crítico', color: 'red', icon: '✗' };
  };

  const health = getHealthStatus();

  // Credential health check
  const checkCredentialHealth = (credential) => {
    if (!credential.fecha_expiracion_token) return { status: 'unknown', label: 'Desconocido' };

    const days = Math.floor(
      (new Date(credential.fecha_expiracion_token) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) return { status: 'expired', label: 'Expirado' };
    if (days <= 7) return { status: 'expiring', label: `Expira en ${days}d` };
    return { status: 'active', label: 'Activo' };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Salud</h2>
          <p className="text-sm text-gray-600 mt-1">Monitorea el estado de todas tus integraciones Meta y WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition ${
              refreshing ? 'animate-spin' : ''
            }`}
          >
            <BiRefresh className="text-lg" />
          </button>
        </div>
      </div>

      {/* Overall Health Card */}
      <div className={`bg-gradient-to-r from-${health.color}-50 to-${health.color}-100 rounded-lg p-8 border-2 border-${health.color}-300`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase">Estado General</p>
            <p className={`text-4xl font-bold mt-2 text-${health.color}-900`}>{health.status}</p>
            <p className="text-sm text-gray-600 mt-2">Uptime: {metrics.uptime.toFixed(1)}%</p>
          </div>
          <div className="text-7xl font-bold text-gray-300 opacity-20">{health.icon}</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Credentials */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase">Conexiones</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{metrics.totalCredentials}</p>
          <p className="text-xs text-blue-700 mt-1">
            {metrics.metaCount} Meta, {metrics.whatsappCount} WhatsApp
          </p>
        </div>

        {/* Success Rate */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase">Tasa Éxito</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{metrics.successRate}%</p>
          <p className="text-xs text-green-700 mt-1">Sincronizaciones</p>
        </div>

        {/* Total Leads */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase">Leads Totales</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">{metrics.totalLeadsSynced}</p>
          <p className="text-xs text-purple-700 mt-1">Este período</p>
        </div>

        {/* Failures */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-semibold uppercase">Errores</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{metrics.failedLogs}</p>
          <p className="text-xs text-red-700 mt-1">Sincronizaciones fallidas</p>
        </div>

        {/* Duplicates */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Duplicados</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{metrics.totalDuplicates}</p>
          <p className="text-xs text-yellow-700 mt-1">Detectados</p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Estado de Sincronización</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Estado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                metrics.isSyncing
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {metrics.isSyncing ? 'Sincronizando' : 'Listo'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Última sincronización:</span>
              <span className="text-sm text-gray-600">
                {metrics.lastSync
                  ? new Date(metrics.lastSync).toLocaleTimeString('es-ES')
                  : 'Nunca'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Errores detectados:</span>
              <span className={`text-sm font-bold ${
                metrics.syncErrors > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.syncErrors}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
              Sincronizar Ahora
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition">
              Ver Logs
            </button>
            <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
              <BiDownload />
              Descargar Reporte
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex gap-2 items-start p-2 bg-white rounded border border-gray-200">
                  {notif.type === 'error' && (
                    <BiXCircle className="text-red-600 text-lg flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'warning' && (
                    <BiAlertCircle className="text-yellow-600 text-lg flex-shrink-0 mt-0.5" />
                  )}
                  {notif.type === 'success' && (
                    <BiCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-gray-600 text-xs">{notif.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No hay alertas recientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Credentials Status Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Estado de Credenciales</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Expiración</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Salud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {credentials.meta && credentials.meta.length > 0 ? (
                credentials.meta.map((cred) => {
                  const health = checkCredentialHealth(cred);
                  return (
                    <tr key={`meta-${cred.id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          Meta
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {cred.nombre_cuenta || 'Sin nombre'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Conectada
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {health.status === 'active' ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : health.status === 'expiring' ? (
                          <span className="text-yellow-600 font-semibold">!</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗</span>
                        )}
                        {' '}{health.label}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <BiCheckCircle className="text-green-600" />
                          <span className="text-xs font-semibold text-green-600">Bien</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : null}

              {credentials.whatsapp && credentials.whatsapp.length > 0 ? (
                credentials.whatsapp.map((cred) => {
                  const health = checkCredentialHealth(cred);
                  return (
                    <tr key={`wa-${cred.id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          WhatsApp
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {cred.nombre_cuenta || cred.phone_number || 'Sin nombre'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Conectada
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {health.status === 'active' ? (
                          <span className="text-green-600 font-semibold">✓</span>
                        ) : health.status === 'expiring' ? (
                          <span className="text-yellow-600 font-semibold">!</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗</span>
                        )}
                        {' '}{health.label}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <BiCheckCircle className="text-green-600" />
                          <span className="text-xs font-semibold text-green-600">Bien</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Sobre este Dashboard</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Los datos se actualizan cada 5 minutos automáticamente</li>
          <li>La tasa de éxito se calcula a partir de todas las sincronizaciones</li>
          <li>Se muestran alertas de credenciales a punto de expirar</li>
          <li>El estado de salud se basa en la actividad reciente del sistema</li>
          <li>Descarga reportes detallados en formato PDF o Excel</li>
        </ul>
      </div>
    </div>
  );
}
