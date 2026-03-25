import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointment, deleteAppointment, fetchAppointments, updateAppointment } from "../api/appointments";
import { createPlace, deletePlace, fetchPlaces, updatePlace } from "../api/places";
import type { AppointmentPayload, AppointmentUpdatePayload, PlacePayload, PlaceUpdatePayload } from "../types/scheduler";

export function useAppointments(userId: string) {
  return useQuery({
    queryKey: ["appointments", userId],
    queryFn: () => fetchAppointments(userId)
  });
}

export function usePlaces(userId: string) {
  return useQuery({
    queryKey: ["places", userId],
    queryFn: () => fetchPlaces(userId)
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(payload),
    onSuccess: async (appointment) => {
      await queryClient.invalidateQueries({ queryKey: ["appointments", appointment.userId] });
    }
  });
}

export function useUpdateAppointment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AppointmentUpdatePayload }) => updateAppointment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments", userId] });
    }
  });
}

export function useDeleteAppointment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments", userId] });
    }
  });
}

export function useCreatePlace(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlacePayload) => createPlace(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["places", userId] });
    }
  });
}

export function useUpdatePlace(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PlaceUpdatePayload }) => updatePlace(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["places", userId] });
    }
  });
}

export function useDeletePlace(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlace(id, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["places", userId] });
    }
  });
}
