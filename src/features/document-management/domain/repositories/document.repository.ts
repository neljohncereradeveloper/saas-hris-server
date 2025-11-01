import { Document } from '../models/document.model';
// import { DocumentScope } from '../enum/document-scope.enum';

export interface DocumentRepository<Context = unknown> {
  create(document: Document, context: Context): Promise<Document>;
  update(
    id: number,
    dto: Partial<Document>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, isActive: boolean, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Document | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    context?: Context,
  ): Promise<{
    data: Document[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;

  // // Document-specific methods
  // findByEmployeeId(employeeId: number, context: Context): Promise<Document[]>;
  // findByScope(scope: DocumentScope, context: Context): Promise<Document[]>;
  // findByDocumentType(
  //   documentType: string,
  //   context: Context,
  // ): Promise<Document[]>;
  // findByTargetDepartment(
  //   department: string,
  //   context: Context,
  // ): Promise<Document[]>;
  // findByTargetBranch(branch: string, context: Context): Promise<Document[]>;
  // findExpiringDocuments(
  //   daysFromNow: number,
  //   context: Context,
  // ): Promise<Document[]>;
  // findByUploadedBy(uploadedBy: string, context: Context): Promise<Document[]>;
  // findActiveDocuments(context: Context): Promise<Document[]>;

  // // Search and filter methods
  // searchByTitle(title: string, context: Context): Promise<Document[]>;
  // searchByDescription(
  //   description: string,
  //   context: Context,
  // ): Promise<Document[]>;
  // findByDateRange(
  //   startDate: Date,
  //   endDate: Date,
  //   context: Context,
  // ): Promise<Document[]>;

  // // Utility methods
  // countByScope(scope: DocumentScope, context: Context): Promise<number>;
  // countByEmployee(employeeId: number, context: Context): Promise<number>;
}
