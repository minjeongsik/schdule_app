import type { Request, Response } from "express";
import { HttpError } from "../../utils/http-error.js";
import { AppointmentsService } from "./appointments.service.js";

function getRouteParam(value: string | string[] | undefined, name: string) {
  if (!value || Array.isArray(value)) {
    throw new HttpError(400, `${name} is required`);
  }

  return value;
}

export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  list = async (req: Request, res: Response) => {
    const appointments = await this.appointmentsService.list(req.query);
    res.json(appointments);
  };

  get = async (req: Request, res: Response) => {
    const appointment = await this.appointmentsService.get(getRouteParam(req.params.id, "id"));
    res.json(appointment);
  };

  create = async (req: Request, res: Response) => {
    const appointment = await this.appointmentsService.create(req.body);
    res.status(201).json(appointment);
  };

  update = async (req: Request, res: Response) => {
    const appointment = await this.appointmentsService.update(getRouteParam(req.params.id, "id"), req.body);
    res.json(appointment);
  };

  selectRoute = async (req: Request, res: Response) => {
    const appointment = await this.appointmentsService.selectRoute(
      getRouteParam(req.params.id, "id"),
      getRouteParam(req.params.routeId, "routeId")
    );
    res.json(appointment);
  };

  createRoute = async (req: Request, res: Response) => {
    const appointment = await this.appointmentsService.createRoute(getRouteParam(req.params.id, "id"), req.body);
    res.status(201).json(appointment);
  };

  remove = async (req: Request, res: Response) => {
    await this.appointmentsService.remove(getRouteParam(req.params.id, "id"));
    res.status(204).send();
  };
}
