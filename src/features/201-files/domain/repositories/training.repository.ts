import { Training } from '../models/training.model';

export interface TrainingRepository<Context = unknown> {
  create(training: Training, context: Context): Promise<Training>;
  update(
    id: number,
    dto: Partial<Training>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Training | null>;
  findEmployeesTraining(employeeId: number): Promise<{
    data: Training[];
  }>;
}
