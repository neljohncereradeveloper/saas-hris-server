export interface UpdateDocumentCommand {
  title: string;
  fileName?: string;
  filePath?: string; // path or URL of uploaded file
  scope: string; // Employee or General
  employeeId?: number; // optional if scope = Employee
  documentType?: string; // reference to document type
  description?: string;
  expirationDate?: Date;
  targetDepartment?: string; // optional for group-wide docs
  targetBranch?: string; // optional for branch-wide docs
}
