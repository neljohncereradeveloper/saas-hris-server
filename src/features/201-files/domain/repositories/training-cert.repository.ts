import { TrainingCert } from '../models/training-cert.model';

export interface TrainingCertRepository<Context = unknown> {
  create(trainingCert: TrainingCert, context: Context): Promise<TrainingCert>;
  update(
    id: number,
    dto: Partial<TrainingCert>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<TrainingCert | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: TrainingCert[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    context: Context,
  ): Promise<TrainingCert | null>;
  retrieveForCombobox(): Promise<TrainingCert[]>;
}
