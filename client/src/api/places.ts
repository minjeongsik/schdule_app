import { apiRequest } from "./client";
import type { Place, PlacePayload, PlaceUpdatePayload } from "../types/scheduler";

export function fetchPlaces(userId: string) {
  return apiRequest<Place[]>(`/places?userId=${encodeURIComponent(userId)}`);
}

export function createPlace(payload: PlacePayload) {
  return apiRequest<Place>("/places", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePlace(id: string, payload: PlaceUpdatePayload) {
  return apiRequest<Place>(`/places/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deletePlace(id: string, userId: string) {
  return apiRequest<void>(`/places/${id}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE"
  });
}
