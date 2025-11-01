import { City } from '../models/city.model';

export interface CityRepository<Context = unknown> {
  create(city: City, context: Context): Promise<City>;
  update(id: number, dto: Partial<City>, context?: Context): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<City | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: City[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context: Context): Promise<City | null>;
  retrieveForCombobox(): Promise<City[]>;
}
