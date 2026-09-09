import api from "../axiosMiddleware";
import * as apiEndpoints from "../apiEndpoints";
import {
  createFilteredFormData,
  getFilteredParams,
} from "@/utils/helperFunction";

// 77. GET AGENT APPOINTMENT BOOKING PREFERENCES
export const getAgentAppointmentBookingPreferencesApi = async () => {
  const res = await api.get(apiEndpoints.GET_APPOINTMENT_BOOKING_PREFERENCES);
  return res.data;
};


// 78. POST Agent Appointment Booking Preferences
export const postAgentAppointmentBookingPreferencesApi = async ({
  meeting_duration_minutes = 0,
  lead_time_minutes = 0,
  buffer_time_minutes = 0,
  auto_confirm = 0,
  cancel_reschedule_buffer_minutes = 0,
  auto_cancel_after_minutes = 0,
  auto_cancel_message = "",
  daily_booking_limit = 0,
  availability_types = "",
  anti_spam_enabled = 0,
  timezone = ""
}) => {

  const formData = createFilteredFormData({
    meeting_duration_minutes,
    lead_time_minutes,
    buffer_time_minutes,
    auto_confirm,
    cancel_reschedule_buffer_minutes,
    auto_cancel_after_minutes,
    auto_cancel_message,
    daily_booking_limit,
    availability_types,
    anti_spam_enabled,
    timezone
  });
  const res = await api.post(apiEndpoints.POST_APPOINTMENT_BOOKING_PREFERENCES, formData);
  return res.data;
};

// 79. GET Agent Time Schedule
export const getAgentTimeScheduleApi = async () => {
  const res = await api.get(apiEndpoints.GET_AGENT_TIME_SCHEDULE);
  return res.data;
};

// 80. POST Agent Time Schedule
export const postAgentTimeScheduleApi = async ({ schedule = {}, deletedSlots = [] }) => {
  const formData = new FormData();

  // Handle compressed schedule format
  // Expected format: { "0": { id: "", day: "monday", start_time: "09:00", end_time: "12:30" }, ... }
  if (typeof schedule === 'object' && schedule !== null) {
    Object.keys(schedule).forEach((index) => {
      const scheduleItem = schedule[index];

      // Add ID only if it exists and is not empty
      if (scheduleItem.id && scheduleItem.id !== '') {
        formData.append(`schedule[${index}][id]`, scheduleItem.id);
      }

      // Add required fields
      formData.append(`schedule[${index}][day]`, scheduleItem.day);
      formData.append(`schedule[${index}][start_time]`, scheduleItem.start_time);
      formData.append(`schedule[${index}][end_time]`, scheduleItem.end_time);
    });
  }
  // Pass deletedSlots as an array if it exists and is a non-empty array
  if (deletedSlots && Array.isArray(deletedSlots) && deletedSlots.length > 0) {
    deletedSlots.forEach((slotId, index) => {
      if (slotId !== null && slotId !== undefined && slotId !== '') {
        formData.append(`deleted_ids[${index}]`, slotId);
      }
    });
  }


  const res = await api.post(apiEndpoints.POST_SET_AGENT_TIME_SCHEDULE, formData);
  return res.data;
};

// 81. Get Month Wise Time Schedules
export const getMonthWiseTimeSchedulesApi = async ({
  month = "",
  year = "",
  agent_id = ""
}) => {
  const params = getFilteredParams({
    month,
    year,
    agent_id
  });
  const res = await api.get(apiEndpoints.GET_MONTH_WISE_TIME_SLOTS, { params });
  return res.data;
};

// 82. Get Extra Time Slots API
export const getExtraTimeSlotsApi = async () => {
  const res = await api.get(apiEndpoints.GET_EXTRA_TIME_SLOTS);
  return res.data;
};

// 83. Post Extra Time Slots API
export const postExtraTimeSlotsApi = async ({
  extraTimeSlots = [],
  date = ""
}) => {
  const formData = new FormData();
  extraTimeSlots.forEach((extraTimeSlot, index) => {
    if (extraTimeSlot.id && !String(extraTimeSlot.id)?.includes("new-")) {
      formData.append(`extra_time_slots[${index}][id]`, extraTimeSlot.id);
    }
    formData.append(`extra_time_slots[${index}][date]`, date);
    formData.append(`extra_time_slots[${index}][start_time]`, extraTimeSlot.start_time);
    formData.append(`extra_time_slots[${index}][end_time]`, extraTimeSlot.end_time);
    if (extraTimeSlot.reason) {
      formData.append(`extra_time_slots[${index}][reason]`, extraTimeSlot.reason);
    }
  });
  // const formData = createFilteredFormData({
  //   date,
  //   start_time,
  //   end_time,
  //   reason,
  // });
  const res = await api.post(apiEndpoints.MANAGE_EXTRA_TIME_SLOTS, formData);
  return res.data;
};

// 84. Delete Extra Time Slots API
export const deleteExtraTimeSlotsApi = async ({
  removeExtraTimeSlotIds = []
}) => {
  const formData = new FormData();
  if (Array.isArray(removeExtraTimeSlotIds) && removeExtraTimeSlotIds.length > 0) {
    removeExtraTimeSlotIds.forEach((slotId, index) => {
      if (slotId !== null && slotId !== undefined && slotId !== '' && !String(slotId).includes("new-")) {
        formData.append(`slot_ids[${index}]`, slotId);
      }
    });
  }
  const res = await api.post(apiEndpoints.DELETE_EXTRA_TIME_SLOTS, formData);
  return res.data;
};


// 85. Check Agent Booking Availability API
export const checkAgentBookingAvailabilityApi = async ({
  agent_id = "",
  date = "",
  start_time = "",
  end_time = "",
}) => {
  const params = getFilteredParams({
    agent_id,
    date,
    start_time,
    end_time,
  });
  const res = await api.get(apiEndpoints.CHECK_AGENT_APPOINTMENT_AVAILABILITY, { params });
  return res.data;
};


// 86. Book Appointment API
export const bookAppointmentApi = async ({
  property_id,
  meeting_type,
  date,
  start_time,
  end_time,
  notes
}) => {
  const formData = createFilteredFormData({
    property_id,
    meeting_type,
    date,
    start_time,
    end_time,
    notes
  });
  const res = await api.post(apiEndpoints.BOOK_APPOINTMENT, formData);
  return res.data;
};

// 93. Get User Appointments
export const getUserAppointmentsApi = async ({
  limit = "",
  offset = "",
  status = "",
  date_filter = "",
  meeting_type = ""
}) => {
  const params = getFilteredParams({
    limit,
    offset,
    status,
    date_filter,
    meeting_type
  });
  const res = await api.get(apiEndpoints.GET_USER_APPOINTMENTS, { params });
  return res.data;
};

// 94. Get Appointment Details
export const getAgentAppointmentsApi = async ({
  limit = "",
  offset = "",
  status = "",
  date_filter = "",
  meeting_type = ""
}) => {
  const params = getFilteredParams({
    limit,
    offset,
    status,
    date_filter,
    meeting_type
  });
  const res = await api.get(apiEndpoints.GET_AGENT_APPOINTMENTS, { params });
  return res.data;
};


// 95. Update Appointment Status
export const updateAppointmentStatusApi = async ({
  appointment_id = "",
  status = "",
  reason = "",
  date,
  start_time = "",
  end_time = "",
  meeting_type = ""
}) => {
  const formData = createFilteredFormData({
    appointment_id,
    status,
    reason,
    date,
    start_time,
    end_time,
    meeting_type
  });
  const res = await api.post(apiEndpoints.UPDATE_APPOINTMENT_STATUS, formData);
  return res.data;
};

// 96. Report User API
export const reportUserApi = async ({
  user_id = "",
  reason = "",
}) => {
  const formData = createFilteredFormData({
    user_id,
    reason,
  });
  const res = await api.post(apiEndpoints.APPOINTMENT_REPORT_USER, formData);
  return res.data;
};

// 97. Update meeting type API 
export const updateMeetingTypeApi = async ({
  appointment_id = "",
  meeting_type = ""
}) => {
  const formData = createFilteredFormData({
    appointment_id,
    meeting_type
  });
  const res = await api.post(apiEndpoints.UPDATE_APPOINTMENT_MEETING_TYPE, formData);
  return res.data;
};
