import { useMemo, useState } from "react";
import { toApiError } from "../api/client";
import {
  useAppointments,
  useCreateAppointment,
  useCreatePlace,
  useDeletePlace,
  useDeleteAppointment,
  usePlaces,
  useUpdatePlace,
  useUpdateAppointment
} from "../hooks/use-scheduler";
import type {
  Appointment,
  AppointmentPayload,
  AppointmentStatus,
  AppointmentUpdatePayload,
  FieldErrors,
  Place,
  PlacePayload,
  TransportMode
} from "../types/scheduler";

const DEMO_USER_ID = "demo-user";
const transportOptions: TransportMode[] = ["WALK", "CAR", "TRANSIT", "BICYCLE"];
const statusOptions: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELED"];

function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : "";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDuration(minutesTotalSeconds: number) {
  const hours = Math.floor(minutesTotalSeconds / 3600);
  const minutes = Math.round((minutesTotalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function emptyPlaceForm() {
  return {
    name: "",
    roadAddress: "",
    jibunAddress: "",
    lat: "37.5665",
    lng: "126.9780"
  };
}

function emptyFieldErrors(): FieldErrors {
  return {};
}

function getFieldError(fieldErrors: FieldErrors, field: string) {
  return fieldErrors[field]?.[0] ?? null;
}

function buildInitialAppointmentForm(selected: Appointment | undefined) {
  return {
    title: selected?.title ?? "",
    memo: selected?.memo ?? "",
    startAt: toDateTimeInputValue(selected?.startAt),
    endAt: toDateTimeInputValue(selected?.endAt),
    transportMode: selected?.transportMode ?? "TRANSIT",
    status: selected?.status ?? "SCHEDULED",
    originPlaceId: selected?.originPlaceId ?? "",
    destinationPlaceId: selected?.destinationPlaceId ?? ""
  };
}

export function SchedulerDashboardPage() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [appointmentForm, setAppointmentForm] = useState(buildInitialAppointmentForm(undefined));
  const [placeForm, setPlaceForm] = useState(emptyPlaceForm());
  const [appointmentFieldErrors, setAppointmentFieldErrors] = useState<FieldErrors>(emptyFieldErrors());
  const [placeFieldErrors, setPlaceFieldErrors] = useState<FieldErrors>(emptyFieldErrors());
  const [appointmentFormError, setAppointmentFormError] = useState<string | null>(null);
  const [placeFormError, setPlaceFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [placeMessage, setPlaceMessage] = useState<string | null>(null);

  const appointmentsQuery = useAppointments(DEMO_USER_ID);
  const placesQuery = usePlaces(DEMO_USER_ID);
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment(DEMO_USER_ID);
  const deleteAppointmentMutation = useDeleteAppointment(DEMO_USER_ID);
  const createPlaceMutation = useCreatePlace(DEMO_USER_ID);
  const updatePlaceMutation = useUpdatePlace(DEMO_USER_ID);
  const deletePlaceMutation = useDeletePlace(DEMO_USER_ID);

  const appointments = appointmentsQuery.data ?? [];
  const places = placesQuery.data ?? [];
  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId),
    [appointments, selectedAppointmentId]
  );
  const selectedPlace = useMemo(() => places.find((place) => place.id === selectedPlaceId), [places, selectedPlaceId]);

  function resetAppointmentForm() {
    setSelectedAppointmentId(null);
    setAppointmentForm(buildInitialAppointmentForm(undefined));
    setAppointmentFieldErrors(emptyFieldErrors());
    setAppointmentFormError(null);
    setFormMessage(null);
  }

  function resetPlaceForm() {
    setSelectedPlaceId(null);
    setPlaceForm(emptyPlaceForm());
    setPlaceFieldErrors(emptyFieldErrors());
    setPlaceFormError(null);
    setPlaceMessage(null);
  }

  function handleSelectAppointment(appointment: Appointment) {
    setSelectedAppointmentId(appointment.id);
    setAppointmentForm(buildInitialAppointmentForm(appointment));
    setAppointmentFieldErrors(emptyFieldErrors());
    setAppointmentFormError(null);
    setFormMessage(null);
  }

  function handleSelectPlace(place: Place) {
    setSelectedPlaceId(place.id);
    setPlaceForm({
      name: place.name,
      roadAddress: place.roadAddress ?? "",
      jibunAddress: place.jibunAddress ?? "",
      lat: String(place.lat),
      lng: String(place.lng)
    });
    setPlaceFieldErrors(emptyFieldErrors());
    setPlaceFormError(null);
    setPlaceMessage(null);
  }

  async function handleAppointmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppointmentFieldErrors(emptyFieldErrors());
    setAppointmentFormError(null);
    setFormMessage(null);

    const payload: AppointmentPayload = {
      userId: DEMO_USER_ID,
      title: appointmentForm.title.trim(),
      memo: appointmentForm.memo.trim() || undefined,
      startAt: toIsoDateTime(appointmentForm.startAt),
      endAt: appointmentForm.endAt ? toIsoDateTime(appointmentForm.endAt) : undefined,
      transportMode: appointmentForm.transportMode,
      originPlaceId: appointmentForm.originPlaceId || undefined,
      destinationPlaceId: appointmentForm.destinationPlaceId
    };

    try {
      if (selectedAppointment) {
        const updatePayload: AppointmentUpdatePayload = {
          title: payload.title,
          memo: payload.memo ?? null,
          startAt: payload.startAt,
          endAt: payload.endAt ?? null,
          transportMode: payload.transportMode,
          status: appointmentForm.status,
          originPlaceId: payload.originPlaceId ?? null,
          destinationPlaceId: payload.destinationPlaceId
        };

        await updateAppointmentMutation.mutateAsync({
          id: selectedAppointment.id,
          payload: updatePayload
        });
        setFormMessage("Appointment updated.");
        return;
      }

      const created = await createAppointmentMutation.mutateAsync(payload);
      setSelectedAppointmentId(created.id);
      setAppointmentForm(buildInitialAppointmentForm(created));
      setFormMessage("Appointment created.");
    } catch (error) {
      const apiError = toApiError(error);
      setAppointmentFieldErrors(apiError.fieldErrors);
      setAppointmentFormError(apiError.formError ?? apiError.pageError);
    }
  }

  async function handleDeleteSelected() {
    if (!selectedAppointment) {
      return;
    }

    setAppointmentFormError(null);
    try {
      await deleteAppointmentMutation.mutateAsync(selectedAppointment.id);
      resetAppointmentForm();
      setFormMessage("Appointment deleted.");
    } catch (error) {
      const apiError = toApiError(error);
      setAppointmentFormError(apiError.formError ?? apiError.pageError);
    }
  }

  async function handlePlaceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaceFieldErrors(emptyFieldErrors());
    setPlaceFormError(null);
    setPlaceMessage(null);

    const payload: PlacePayload = {
      userId: DEMO_USER_ID,
      name: placeForm.name.trim(),
      roadAddress: placeForm.roadAddress.trim() || undefined,
      jibunAddress: placeForm.jibunAddress.trim() || undefined,
      lat: Number(placeForm.lat),
      lng: Number(placeForm.lng)
    };

    try {
      if (selectedPlace) {
        await updatePlaceMutation.mutateAsync({
          id: selectedPlace.id,
          payload: {
            userId: payload.userId,
            name: payload.name,
            roadAddress: payload.roadAddress ?? null,
            jibunAddress: payload.jibunAddress ?? null,
            lat: payload.lat,
            lng: payload.lng
          }
        });
        setPlaceMessage("Place updated.");
        return;
      }

      const place = await createPlaceMutation.mutateAsync(payload);
      setPlaceForm(emptyPlaceForm());
      setAppointmentForm((current) => ({
        ...current,
        destinationPlaceId: current.destinationPlaceId || place.id
      }));
      setPlaceMessage("Place created.");
    } catch (error) {
      const apiError = toApiError(error);
      setPlaceFieldErrors(apiError.fieldErrors);
      setPlaceFormError(apiError.formError ?? apiError.pageError);
    }
  }

  async function handleDeleteSelectedPlace() {
    if (!selectedPlace) {
      return;
    }

    setPlaceFormError(null);
    try {
      await deletePlaceMutation.mutateAsync(selectedPlace.id);
      setAppointmentForm((current) => ({
        ...current,
        originPlaceId: current.originPlaceId === selectedPlace.id ? "" : current.originPlaceId,
        destinationPlaceId: current.destinationPlaceId === selectedPlace.id ? "" : current.destinationPlaceId
      }));
      resetPlaceForm();
      setPlaceMessage("Place deleted.");
    } catch (error) {
      const apiError = toApiError(error);
      setPlaceFormError(apiError.formError ?? apiError.pageError);
    }
  }

  const isSubmitting = createAppointmentMutation.isPending || updateAppointmentMutation.isPending;
  const isPlaceSubmitting =
    createPlaceMutation.isPending || updatePlaceMutation.isPending || deletePlaceMutation.isPending;
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((item) => item.status === "SCHEDULED").length,
    completed: appointments.filter((item) => item.status === "COMPLETED").length
  };
  const pageError =
    (appointmentsQuery.error ? toApiError(appointmentsQuery.error).pageError : null) ||
    (placesQuery.error ? toApiError(placesQuery.error).pageError : null);
  const selectedRoute = selectedAppointment?.routes.find((route) => route.selectedOption) ?? null;

  return (
    <main className="scheduler-shell">
      <section className="scheduler-hero">
        <div>
          <p className="hero-kicker">Map Scheduler MVP</p>
          <h1>Manage places, trips, and appointments from one dashboard.</h1>
          <p className="hero-copy">
            The current MVP uses the seeded demo user <strong>{DEMO_USER_ID}</strong>. Create places first, then add
            appointments with a destination and transport mode.
          </p>
        </div>
        <div className="hero-stats compact-stats">
          <article>
            <strong>{stats.total}</strong>
            <span>Total</span>
          </article>
          <article>
            <strong>{stats.scheduled}</strong>
            <span>Scheduled</span>
          </article>
          <article>
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </article>
        </div>
      </section>

      <section className="quick-guide compact-guide">
        <article className="guide-card">
          <h2>1. Add places</h2>
          <p>Use the right panel to save common destinations like home, office, or meeting spots.</p>
        </article>
        <article className="guide-card">
          <h2>2. Create appointments</h2>
          <p>Fill out title, time, destination, and transport mode. New items appear in the list immediately.</p>
        </article>
        <article className="guide-card">
          <h2>3. Edit from the list</h2>
          <p>Select any appointment in the middle column to switch the form into edit mode.</p>
        </article>
      </section>

      {pageError ? <p className="error-banner">{pageError}</p> : null}

      <section className="scheduler-grid">
        <article className="panel">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="panel-kicker">Appointment Form</p>
              <h2>{selectedAppointment ? "Edit appointment" : "New appointment"}</h2>
              <p className="panel-description">Select a destination and save changes from this form.</p>
            </div>
            {selectedAppointment ? (
              <button className="secondary-button" type="button" onClick={resetAppointmentForm}>
                Clear form
              </button>
            ) : null}
          </div>
          {appointmentFormError ? <p className="form-error">{appointmentFormError}</p> : null}

          <form className="stack-form" onSubmit={handleAppointmentSubmit}>
            <label>
              Title
              <input
                value={appointmentForm.title}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Example: Lunch meeting in Gangnam"
                required
              />
              {getFieldError(appointmentFieldErrors, "title") ? (
                <span className="field-error">{getFieldError(appointmentFieldErrors, "title")}</span>
              ) : null}
            </label>

            <label>
              Memo
              <textarea
                rows={4}
                value={appointmentForm.memo}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, memo: event.target.value }))}
                placeholder="Notes for this appointment"
              />
              {getFieldError(appointmentFieldErrors, "memo") ? (
                <span className="field-error">{getFieldError(appointmentFieldErrors, "memo")}</span>
              ) : null}
            </label>

            <div className="two-column">
              <label>
                Start time
                <input
                  type="datetime-local"
                  value={appointmentForm.startAt}
                  onChange={(event) => setAppointmentForm((current) => ({ ...current, startAt: event.target.value }))}
                  required
                />
                {getFieldError(appointmentFieldErrors, "startAt") ? (
                  <span className="field-error">{getFieldError(appointmentFieldErrors, "startAt")}</span>
                ) : null}
              </label>

              <label>
                End time
                <input
                  type="datetime-local"
                  value={appointmentForm.endAt}
                  onChange={(event) => setAppointmentForm((current) => ({ ...current, endAt: event.target.value }))}
                />
                {getFieldError(appointmentFieldErrors, "endAt") ? (
                  <span className="field-error">{getFieldError(appointmentFieldErrors, "endAt")}</span>
                ) : null}
              </label>
            </div>

            <div className="two-column">
              <label>
                Transport
                <select
                  value={appointmentForm.transportMode}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      transportMode: event.target.value as TransportMode
                    }))
                  }
                >
                  {transportOptions.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                {getFieldError(appointmentFieldErrors, "transportMode") ? (
                  <span className="field-error">{getFieldError(appointmentFieldErrors, "transportMode")}</span>
                ) : null}
              </label>

              <label>
                Status
                <select
                  value={appointmentForm.status}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      status: event.target.value as AppointmentStatus
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {getFieldError(appointmentFieldErrors, "status") ? (
                  <span className="field-error">{getFieldError(appointmentFieldErrors, "status")}</span>
                ) : null}
              </label>
            </div>

            <label>
              Origin place
              <select
                value={appointmentForm.originPlaceId}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, originPlaceId: event.target.value }))}
              >
                <option value="">No origin</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
              {getFieldError(appointmentFieldErrors, "originPlaceId") ? (
                <span className="field-error">{getFieldError(appointmentFieldErrors, "originPlaceId")}</span>
              ) : null}
            </label>

            <label>
              Destination place
              <select
                value={appointmentForm.destinationPlaceId}
                onChange={(event) =>
                  setAppointmentForm((current) => ({ ...current, destinationPlaceId: event.target.value }))
                }
                required
              >
                <option value="">Select destination</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
              {getFieldError(appointmentFieldErrors, "destinationPlaceId") ? (
                <span className="field-error">{getFieldError(appointmentFieldErrors, "destinationPlaceId")}</span>
              ) : null}
            </label>

            <div className="action-row">
              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {selectedAppointment ? "Update appointment" : "Create appointment"}
              </button>
              {selectedAppointment ? (
                <button
                  className="danger-button"
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={deleteAppointmentMutation.isPending}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </form>

          {formMessage ? <p className="success-text">{formMessage}</p> : null}
          {selectedAppointment ? (
            <section className="route-section">
              <div className="route-section-header">
                <strong>Route candidates</strong>
                <span className="soft-badge">{selectedAppointment.routes.length} routes</span>
              </div>
              {selectedAppointment.routes.length ? (
                <div className="route-list">
                  {selectedAppointment.routes.map((route) => (
                    <article key={route.id} className={`route-card ${route.selectedOption ? "active" : ""}`}>
                      <div className="route-card-top">
                        <strong>{route.summary ?? "Unnamed route candidate"}</strong>
                        {route.selectedOption ? <span className="status-pill status-completed">Selected</span> : null}
                      </div>
                      <p className="meta-line">
                        {Math.round(route.distanceMeters / 100) / 10} km · {formatDuration(route.durationSeconds)}
                      </p>
                      <p className="meta-line">{route.waypoints.length} waypoint(s)</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact-empty-state">
                  <strong>No route candidates yet.</strong>
                  <p>Add route generation later without changing this appointment model.</p>
                </div>
              )}
            </section>
          ) : null}
        </article>

        <article className="panel panel-scroll">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="panel-kicker">Appointments</p>
              <h2>Appointment list</h2>
              <p className="panel-description">Pick an item to load it into the form on the left.</p>
            </div>
            <span className="soft-badge">{appointments.length} items</span>
          </div>

          <div className="appointment-list">
            {appointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                className={`appointment-card ${selectedAppointmentId === appointment.id ? "active" : ""}`}
                onClick={() => handleSelectAppointment(appointment)}
              >
                <div className="appointment-card-top">
                  <strong>{appointment.title}</strong>
                  <span className={`status-pill status-${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                </div>
                <p className="meta-line">{formatDateTime(appointment.startAt)}</p>
                <p className="meta-line">
                  {appointment.originPlace?.name ?? "No origin"} to {appointment.destinationPlace.name}
                </p>
                <p className="meta-line">{appointment.transportMode}</p>
                <p className="meta-line">
                  {appointment.routes.length} routes
                  {appointment.routes.some((route) => route.selectedOption) ? " · selected candidate ready" : ""}
                </p>
              </button>
            ))}

            {!appointments.length && !appointmentsQuery.isLoading ? (
              <div className="empty-state">
                <strong>No appointments yet.</strong>
                <p>Create your first one from the left form.</p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="panel-kicker">Places</p>
              <h2>{selectedPlace ? "Edit place" : "Place manager"}</h2>
              <p className="panel-description">Keep reusable origins and destinations here.</p>
            </div>
            <div className="panel-actions">
              <span className="soft-badge">{places.length} places</span>
              {selectedPlace ? (
                <button className="secondary-button compact-button" type="button" onClick={resetPlaceForm}>
                  New place
                </button>
              ) : null}
            </div>
          </div>
          {placeFormError ? <p className="form-error">{placeFormError}</p> : null}

          <form className="stack-form compact-form" onSubmit={handlePlaceSubmit}>
            <label>
              Place name
              <input
                value={placeForm.name}
                onChange={(event) => setPlaceForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Example: Home, Office, Cafe"
                required
              />
              {getFieldError(placeFieldErrors, "name") ? (
                <span className="field-error">{getFieldError(placeFieldErrors, "name")}</span>
              ) : null}
            </label>

            <label>
              Road address
              <input
                value={placeForm.roadAddress}
                onChange={(event) => setPlaceForm((current) => ({ ...current, roadAddress: event.target.value }))}
                placeholder="Optional"
              />
              {getFieldError(placeFieldErrors, "roadAddress") ? (
                <span className="field-error">{getFieldError(placeFieldErrors, "roadAddress")}</span>
              ) : null}
            </label>

            <div className="two-column">
              <label>
                Latitude
                <input
                  type="number"
                  step="0.000001"
                  value={placeForm.lat}
                  onChange={(event) => setPlaceForm((current) => ({ ...current, lat: event.target.value }))}
                  required
                />
                {getFieldError(placeFieldErrors, "lat") ? (
                  <span className="field-error">{getFieldError(placeFieldErrors, "lat")}</span>
                ) : null}
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="0.000001"
                  value={placeForm.lng}
                  onChange={(event) => setPlaceForm((current) => ({ ...current, lng: event.target.value }))}
                  required
                />
                {getFieldError(placeFieldErrors, "lng") ? (
                  <span className="field-error">{getFieldError(placeFieldErrors, "lng")}</span>
                ) : null}
              </label>
            </div>

            <div className="action-row">
              <button className="secondary-button" type="submit" disabled={isPlaceSubmitting}>
                {selectedPlace ? "Update place" : "Add place"}
              </button>
              {selectedPlace ? (
                <button
                  className="danger-button"
                  type="button"
                  onClick={handleDeleteSelectedPlace}
                  disabled={deletePlaceMutation.isPending}
                >
                  Delete place
                </button>
              ) : null}
            </div>
          </form>

          {placeMessage ? <p className="success-text">{placeMessage}</p> : null}

          <div className="place-list">
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                className={`place-card place-button ${selectedPlaceId === place.id ? "active" : ""}`}
                onClick={() => handleSelectPlace(place)}
              >
                <strong>{place.name}</strong>
                <p className="meta-line">{place.roadAddress || place.jibunAddress || "No address"}</p>
                <code>{place.id}</code>
              </button>
            ))}
          </div>
        </article>
      </section>

      {selectedAppointment && selectedRoute ? (
        <section className="selected-route-panel">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="panel-kicker">Selected Route</p>
              <h2>{selectedRoute.summary ?? "Selected route candidate"}</h2>
              <p className="panel-description">
                {Math.round(selectedRoute.distanceMeters / 100) / 10} km · {formatDuration(selectedRoute.durationSeconds)}
              </p>
            </div>
          </div>
          <div className="route-list">
            {selectedRoute.waypoints.length ? (
              selectedRoute.waypoints.map((waypoint) => (
                <article key={waypoint.id} className="route-card">
                  <strong>
                    {waypoint.sequence}. {waypoint.name ?? "Waypoint"}
                  </strong>
                  <p className="meta-line">
                    {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                  </p>
                </article>
              ))
            ) : (
              <div className="empty-state compact-empty-state">
                <strong>No waypoints stored.</strong>
                <p>This candidate is still valid without intermediate stops.</p>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
