import { Branch } from '../models/branch.model';

export interface BranchRepository<Context = unknown> {
  create(branch: Branch, context: Context): Promise<Branch>;
  update(id: number, dto: Partial<Branch>, context?: Context): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Branch | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Branch[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<Branch | null>;
  findByBrCode(brCode: string, context: Context): Promise<Branch | null>;
  retrieveForCombobox(): Promise<Branch[]>;
}
