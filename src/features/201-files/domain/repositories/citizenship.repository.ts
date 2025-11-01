import { CitizenShip } from '../models/citizenship.model';

export interface CitizenShipRepository<Context = unknown> {
  create(citizenShip: CitizenShip, context: Context): Promise<CitizenShip>;
  update(
    id: number,
    dto: Partial<CitizenShip>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<CitizenShip | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: CitizenShip[];
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
  ): Promise<CitizenShip | null>;
  retrieveForCombobox(): Promise<CitizenShip[]>;
}
