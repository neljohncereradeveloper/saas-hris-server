import { Barangay } from '../models/barangay.model';

export interface BarangayRepository<Context = unknown> {
  create(barangay: Barangay, context: Context): Promise<Barangay>;
  update(
    id: number,
    dto: Partial<Barangay>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Barangay | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Barangay[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<Barangay | null>;
  retrieveForCombobox(): Promise<Barangay[]>;
}
