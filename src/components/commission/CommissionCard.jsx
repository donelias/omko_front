import React from 'react';
import { formatCurrency } from '@/utils/helperFunction';
import { Badge } from '@/components/ui/badge';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi2';

const CommissionCard = ({ commission, onViewDetails, onAction }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      unpaid: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {commission?.property?.title || `Propiedad #${commission?.property_id}`}
          </h3>
          <p className="text-sm text-gray-500">Agente: {commission?.agent?.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(commission?.status)}>
            {commission?.status}
          </Badge>
          <Badge className={getPaymentStatusColor(commission?.payment_status)}>
            {commission?.payment_status}
          </Badge>
        </div>
      </div>

      {/* Commission Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Monto de Comisión</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(commission?.commission_amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pagado</p>
          <p className="font-semibold text-green-600">
            {formatCurrency(commission?.amount_paid)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pendiente</p>
          <p className="font-semibold text-orange-600">
            {formatCurrency(commission?.pending_amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tasa</p>
          <p className="font-semibold text-gray-900">{commission?.commission_rate}%</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <HiOutlineCalendar className="w-4 h-4" />
          {formatDate(commission?.created_at)}
        </div>
        {commission?.is_overdue && (
          <div className="flex items-center gap-1 text-red-600 font-semibold">
            <HiOutlineClock className="w-4 h-4" />
            VENCIDA
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(commission?.id)}
          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
        >
          Ver Detalles
        </button>
        {commission?.status === 'pending' && (
          <button
            onClick={() => onAction(commission?.id, 'approve')}
            className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
          >
            Aprobar
          </button>
        )}
      </div>
    </div>
  );
};

export default CommissionCard;
