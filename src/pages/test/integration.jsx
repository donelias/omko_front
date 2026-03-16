import React, { useState } from 'react';
import {
  MetaCredentialsManager,
  MetaSyncStatus,
  MetaCampaignManager,
  MetaLeadsSync,
  MetaNotificationsPanel,
  WhatsAppCredentialsManager,
  WhatsAppMessageReceiver,
  IntegrationHealthDashboard,
  IntegrationLogsViewer,
} from '@/components/integrations';

export default function IntegrationTestPage() {
  const [activeTab, setActiveTab] = useState('meta-credentials');
  const [userId] = useState(1); // Simulated user ID

  const tabs = [
    { id: 'meta-credentials', label: 'Meta - Credenciales', component: MetaCredentialsManager },
    { id: 'meta-sync', label: 'Meta - Sincronización', component: MetaSyncStatus },
    { id: 'meta-campaigns', label: 'Meta - Campañas', component: MetaCampaignManager },
    { id: 'meta-leads', label: 'Meta - Leads', component: MetaLeadsSync },
    { id: 'whatsapp-credentials', label: 'WhatsApp - Credenciales', component: WhatsAppCredentialsManager },
    { id: 'whatsapp-messages', label: 'WhatsApp - Mensajes', component: WhatsAppMessageReceiver },
    { id: 'health', label: 'Admin - Salud del Sistema', component: IntegrationHealthDashboard },
    { id: 'logs', label: 'Auditoría - Logs', component: IntegrationLogsViewer },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🧪 Prueba Local - Meta & WhatsApp Integration</h1>
          <p className="text-blue-100">
            Testing de 14 componentes | {tabs.length} tabs disponibles | Usuario ID: {userId}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {ActiveComponent ? (
              <div key={activeTab}>
                <ActiveComponent agentId={userId} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Selecciona un componente para probar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="max-w-7xl mx-auto mt-6 px-4 pb-6">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <h3 className="font-bold text-blue-900 mb-2">💡 Instrucciones de Prueba</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ <strong>Meta Credenciales:</strong> Agrega tus datos de Meta App para probar CRUD</li>
            <li>✅ <strong>Meta Sincronización:</strong> Verifica el estado de sincronización y logs</li>
            <li>✅ <strong>Meta Campañas:</strong> Crea campañas y visualiza leads asociados</li>
            <li>✅ <strong>Meta Leads:</strong> Filtra y busca leads sincronizados</li>
            <li>✅ <strong>WhatsApp Credenciales:</strong> Agrega cuentas de WhatsApp Business</li>
            <li>✅ <strong>WhatsApp Mensajes:</strong> Envía y recibe mensajes</li>
            <li>✅ <strong>Admin - Salud:</strong> Monitorea la salud del sistema</li>
            <li>✅ <strong>Auditoría - Logs:</strong> Visualiza y exporta logs de sincronización</li>
          </ul>
        </div>
      </div>

      {/* Notifications Panel */}
      <MetaNotificationsPanel position="fixed" />
    </div>
  );
}
