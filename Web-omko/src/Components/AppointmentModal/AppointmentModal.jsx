"use client"
import React, { useState } from 'react'
import { Modal, Button, Form, Select, Input, DatePicker, TimePicker, Space, Spin, message } from 'antd'
import { appointmentService } from '@/api'
import { useTranslate } from '@/hooks/useTranslate'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const AppointmentModal = ({ isOpen, onClose, propertyId, propertyTitle, ownerEmail }) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [appointmentType, setAppointmentType] = useState('visit') // 'visit' or 'virtual'
  const translate = useTranslate()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      // Combinar fecha y hora
      const appointmentDateTime = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .format('YYYY-MM-DD HH:mm:ss')

      const appointmentData = {
        property_id: propertyId,
        appointment_type: appointmentType, // 'visit' or 'virtual'
        appointment_date_time: appointmentDateTime,
        visitor_name: values.name,
        visitor_email: values.email,
        visitor_phone: values.phone,
        message: values.message || '',
      }

      const response = await appointmentService.createAppointment(appointmentData)

      if (response && !response.error) {
        toast.success(response.message || translate('appointmentScheduledSuccess'))
        form.resetFields()
        setAppointmentType('visit')
        onClose()
      } else {
        toast.error(response.message || translate('appointmentScheduledError'))
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      toast.error(error.response?.data?.message || translate('appointmentScheduledError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={translate('scheduleAppointment')}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className="appointment-modal"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="appointment-form"
        >
          {/* Tipo de cita */}
          <Form.Item
            label={translate('appointmentType')}
            name="appointmentType"
            initialValue="visit"
            rules={[{ required: true, message: translate('selectAppointmentType') }]}
          >
            <Select
              onChange={(value) => setAppointmentType(value)}
              options={[
                { label: translate('visitProperty'), value: 'visit' },
                { label: translate('virtualMeeting'), value: 'virtual' },
              ]}
            />
          </Form.Item>

          {/* Nombre */}
          <Form.Item
            label={translate('name')}
            name="name"
            rules={[
              { required: true, message: translate('nameRequired') },
              { min: 2, message: translate('nameMinLength') },
            ]}
          >
            <Input placeholder={translate('enterName')} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={translate('email')}
            name="email"
            rules={[
              { required: true, message: translate('emailRequired') },
              { type: 'email', message: translate('invalidEmail') },
            ]}
          >
            <Input type="email" placeholder={translate('enterEmail')} />
          </Form.Item>

          {/* Teléfono */}
          <Form.Item
            label={translate('phone')}
            name="phone"
            rules={[
              { required: true, message: translate('phoneRequired') },
              { pattern: /^[0-9+\-().\s]{7,}$/, message: translate('invalidPhone') },
            ]}
          >
            <Input placeholder={translate('enterPhone')} />
          </Form.Item>

          {/* Fecha */}
          <Form.Item
            label={translate('date')}
            name="date"
            rules={[{ required: true, message: translate('dateRequired') }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => {
                // No permitir fechas pasadas ni hoy
                return current && current < dayjs().endOf('day')
              }}
            />
          </Form.Item>

          {/* Hora */}
          <Form.Item
            label={translate('time')}
            name="time"
            rules={[{ required: true, message: translate('timeRequired') }]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: '100%' }}
              minuteStep={30}
            />
          </Form.Item>

          {/* Mensaje adicional */}
          <Form.Item
            label={translate('additionalMessage')}
            name="message"
          >
            <Input.TextArea
              rows={4}
              placeholder={translate('enterMessage')}
              maxLength={500}
            />
          </Form.Item>

          {/* Info sobre la propiedad */}
          <div className="appointment-info" style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <p><strong>{translate('property')}:</strong> {propertyTitle}</p>
            {appointmentType === 'virtual' && (
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                {translate('virtualMeetingInfo')}
              </p>
            )}
            {appointmentType === 'visit' && (
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                {translate('visitPropertyInfo')}
              </p>
            )}
          </div>

          {/* Botones */}
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              {translate('cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {translate('scheduleAppointment')}
            </Button>
          </Space>
        </Form>
      </Spin>
    </Modal>
  )
}

export default AppointmentModal
