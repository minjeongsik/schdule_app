import { apiRequest } from "./client";
import type { Appointment, AppointmentPayload, AppointmentUpdatePayload, RouteCandidatePayload } from "../types/scheduler";

export function fetchAppointments(userId: string) {
  return apiRequest<Appointment[]>(`/appointments?userId=${encodeURIComponent(userId)}`);
}

export function createAppointment(payload: AppointmentPayload) {
  return apiRequest<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAppointment(id: string, payload: AppointmentUpdatePayload) {
  return apiRequest<Appointment>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function selectAppointmentRoute(id: string, routeId: string) {
  return apiRequest<Appointment>(`/appointments/${id}/routes/${routeId}/select`, {
    method: "PATCH"
  });
}

export function createAppointmentRoute(id: string, payload: RouteCandidatePayload) {
  return apiRequest<Appointment>(`/appointments/${id}/routes`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAppointmentRoute(id: string, routeId: string, payload: RouteCandidatePayload) {
  return apiRequest<Appointment>(`/appointments/${id}/routes/${routeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAppointmentRoute(id: string, routeId: string) {
  return apiRequest<Appointment>(`/appointments/${id}/routes/${routeId}`, {
    method: "DELETE"
  });
}

export function deleteAppointment(id: string) {
  return apiRequest<void>(`/appointments/${id}`, {
    method: "DELETE"
  });
}
