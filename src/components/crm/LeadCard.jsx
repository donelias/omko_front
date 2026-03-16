import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HiOutlineMail, HiOutlinePhone, HiOutlineMapPin, HiOutlineCalendar } from 'react-icons/hi2';

const LeadCard = ({ lead, onViewDetails, onAction }) => {
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{lead?.nombre}</h3>
          <p className="text-sm text-gray-500">
            {lead?.origin === 'meta' && '📱 Meta'} 
            {lead?.origin === 'whatsapp' && '💬 WhatsApp'}
            {lead?.origin === 'manual' && '✍️ Manual'}
            {lead?.origin === 'web' && '🌐 Web'}
          </p>
        </div>
        <Badge className={getStatusColor(lead?.status)}>
          {lead?.status}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        {lead?.email && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <HiOutlineMail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
              {lead.email}
            </a>
          </div>
        )}
        {lead?.telefono && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <HiOutlinePhone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${lead.telefono}`} className="hover:text-blue-600">
              {lead.telefono}
            </a>
          </div>
        )}
      </div>

      {/* Property & Score */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Propiedad</p>
          <p className="text-sm font-semibold text-gray-900">
            {lead?.property?.title ? lead.property.title.substring(0, 20) + '...' : 'Sin asignar'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Score</p>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{lead?.score || 0}</span>
            <Badge className={getScoreBadgeColor(lead?.score || 0)} variant="sm">
              {lead?.score >= 80 ? 'Alto' : lead?.score >= 60 ? 'Medio' : 'Bajo'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Interactions & Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <span>💬 {lead?.interactions_count || 0} interacciones</span>
        </div>
        <div className="flex items-center gap-1">
          <HiOutlineCalendar className="w-3 h-3" />
          {formatDate(lead?.created_at)}
        </div>
      </div>

      {/* Campaign */}
      {lead?.campaign && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <p className="text-xs text-blue-700">
            Campaña: <span className="font-semibold">{lead.campaign.name}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(lead?.id)}
          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
        >
          Ver Detalles
        </button>
        {lead?.status !== 'converted' && lead?.status !== 'rejected' && (
          <button
            onClick={() => onAction(lead?.id, 'contact')}
            className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
          >
            Contactar
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
