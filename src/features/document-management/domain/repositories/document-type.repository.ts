import { DocumentType } from '../models/document-type.model';

export interface DocumentTypeRepository<Context = unknown> {
  create(documentType: DocumentType, context: Context): Promise<DocumentType>;
  update(
    id: number,
    dto: Partial<DocumentType>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<DocumentType | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
  ): Promise<{
    data: DocumentType[];
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
  ): Promise<DocumentType | null>;
  findByName(name: string, context: Context): Promise<DocumentType | null>;
  retrieveForCombobox(): Promise<DocumentType[]>;
}
