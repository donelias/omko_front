import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCommissionByIdApi, getCommissionPaymentLogsApi } from '@/api/apiRoutes';
import { setSelectedCommission, setCommissionsLoading } from '@/redux/slices/commissionSlice';
import { formatCurrency } from '@/utils/helperFunction';
import { HiOutlineXMark } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CommissionDetailModal = ({ commissionId, isOpen, onClose, onAction }) => {
  const dispatch = useDispatch();
  const { selectedCommission, loading } = useSelector(state => state.commissions);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && commissionId) {
      fetchCommissionDetails();
    }
  }, [isOpen, commissionId]);

  const fetchCommissionDetails = async () => {
    try {
      dispatch(setCommissionsLoading(true));
      const response = await getCommissionByIdApi(commissionId);
      dispatch(setSelectedCommission(response.data || response));

      // Fetch payment logs
      setLogsLoading(true);
      const logsResponse = await getCommissionPaymentLogsApi(commissionId);
      setPaymentLogs(logsResponse.data || []);
    } catch (error) {
      console.error('Error fetching commission details:', error);
    } finally {
      dispatch(setCommissionsLoading(false));
      setLogsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles de Comisión</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Commission Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">ID de Comisión</label>
              <p className="font-semibold text-gray-900">#{selectedCommission?.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Estado</label>
              <Badge className={getStatusColor(selectedCommission?.status)}>
                {selectedCommission?.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm text-gray-500">Propiedad</label>
              <p className="font-semibold text-gray-900">
                {selectedCommission?.property?.title}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Agente</label>
              <p className="font-semibold text-gray-900">
                {selectedCommission?.agent?.name}
              </p>
            </div>
          </div>

          {/* Commission Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles Financieros</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Precio de Propiedad</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(selectedCommission?.property_price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasa de Comisión</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedCommission?.commission_rate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(selectedCommission?.commission_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo de Transacción</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedCommission?.transaction_type === 'sale' ? 'Venta' : 'Alquiler'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Estado de Pago</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pagado</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedCommission?.amount_paid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendiente</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(selectedCommission?.pending_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge className={
                  selectedCommission?.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-800'
                    : selectedCommission?.payment_status === 'partially_paid'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }>
                  {selectedCommission?.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {paymentLogs && paymentLogs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {paymentLogs.map((log, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(log.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ref: {log.reference || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium uppercase">
                        {log.payment_method}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedCommission?.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Notas</h3>
              <p className="text-gray-700 text-sm p-3 bg-gray-50 rounded">
                {selectedCommission.notes}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Creada: {formatDate(selectedCommission?.created_at)}</p>
            <p>Última actualización: {formatDate(selectedCommission?.updated_at)}</p>
            {selectedCommission?.is_overdue && (
              <p className="text-red-600 font-semibold">⚠️ COMISIÓN VENCIDA</p>
            )}
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
          
          {selectedCommission?.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => onAction(selectedCommission.id, 'reject')}
              >
                Rechazar
              </Button>
              <Button
                onClick={() => onAction(selectedCommission.id, 'approve')}
              >
                Aprobar
              </Button>
            </>
          )}

          {(selectedCommission?.status === 'approved' || selectedCommission?.status === 'pending') && 
           selectedCommission?.payment_status !== 'paid' && (
            <Button
              variant="secondary"
              onClick={() => onAction(selectedCommission.id, 'record_payment')}
            >
              Registrar Pago
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionDetailModal;
