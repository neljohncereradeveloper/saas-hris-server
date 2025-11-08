import { LeaveYearConfiguration } from '../models/leave-year-configuration.model';

export interface LeaveYearConfigurationRepository<T = any> {
  create(
    configuration: LeaveYearConfiguration,
    manager?: T,
  ): Promise<LeaveYearConfiguration>;

  update(
    id: number,
    configuration: Partial<LeaveYearConfiguration>,
    manager?: T,
  ): Promise<LeaveYearConfiguration>;

  findById(id: number, manager?: T): Promise<LeaveYearConfiguration | null>;

  findByYear(year: string, manager?: T): Promise<LeaveYearConfiguration | null>;

  findActiveForDate(
    date: Date,
    manager?: T,
  ): Promise<LeaveYearConfiguration | null>;

  findAll(manager?: T): Promise<LeaveYearConfiguration[]>;

  softDelete(id: number, isActive: boolean, manager?: T): Promise<boolean>;
}
