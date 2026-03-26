export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";
export type TransportMode = "WALK" | "CAR" | "TRANSIT" | "BICYCLE";
export type FieldErrors = Record<string, string[]>;

export interface Waypoint {
  id: string;
  routeId: string;
  sequence: number;
  name: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteCandidate {
  id: string;
  appointmentId: string;
  originPlaceId: string;
  destinationPlaceId: string;
  summary: string | null;
  distanceMeters: number;
  durationSeconds: number;
  routePolylineJson: string | null;
  selectedOption: boolean;
  createdAt: string;
  updatedAt: string;
  waypoints: Waypoint[];
}

export interface RouteWaypointPayload {
  name?: string;
  lat: number;
  lng: number;
}

export interface RouteCandidatePayload {
  summary?: string;
  distanceMeters: number;
  durationSeconds: number;
  selectedOption?: boolean;
  waypoints?: RouteWaypointPayload[];
}

export interface Place {
  id: string;
  userId: string;
  name: string;
  roadAddress: string | null;
  jibunAddress: string | null;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  memo: string | null;
  startAt: string;
  endAt: string | null;
  transportMode: TransportMode;
  status: AppointmentStatus;
  originPlaceId: string | null;
  destinationPlaceId: string;
  createdAt: string;
  updatedAt: string;
  originPlace: Place | null;
  destinationPlace: Place;
  routes: RouteCandidate[];
}

export interface AppointmentPayload {
  userId: string;
  title: string;
  memo?: string;
  startAt: string;
  endAt?: string;
  transportMode: TransportMode;
  originPlaceId?: string;
  destinationPlaceId: string;
}

export interface AppointmentUpdatePayload {
  title?: string;
  memo?: string | null;
  startAt?: string;
  endAt?: string | null;
  transportMode?: TransportMode;
  status?: AppointmentStatus;
  originPlaceId?: string | null;
  destinationPlaceId?: string;
}

export interface PlacePayload {
  userId: string;
  name: string;
  roadAddress?: string;
  jibunAddress?: string;
  lat: number;
  lng: number;
}

export interface PlaceUpdatePayload {
  userId: string;
  name?: string;
  roadAddress?: string | null;
  jibunAddress?: string | null;
  lat?: number;
  lng?: number;
}
