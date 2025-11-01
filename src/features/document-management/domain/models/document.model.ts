import { Employee } from '@features/shared/domain/models/employee.model';

export class Document {
  id?: number;
  title: string;
  fileName?: string;
  filePath?: string; // path or URL of uploaded file
  scope: string; // Employee or General
  employeeId?: number; // optional if scope = Employee
  employee?: Employee; // optional if scope = Employee
  documentTypeId?: number; // foreign key to document_type table
  documentType?: string; // reference to document type
  description?: string;
  expirationDate?: Date;
  targetDepartment?: string; // optional for group-wide docs
  targetBranch?: string; // optional for branch-wide docs
  uploadedBy?: string; // HR staff or system
  uploadedAt?: Date;
  updatedAt?: Date; // when the document was last updated
  updatedBy?: string; // who updated the document
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    title: string;
    fileName?: string;
    filePath?: string;
    scope: string;
    employeeId?: number;
    employee?: Employee;
    documentTypeId?: number;
    documentType?: string;
    description?: string;

    expirationDate?: Date;

    targetDepartment?: string;
    targetBranch?: string;
    uploadedBy?: string;
    uploadedAt?: Date;
    updatedAt?: Date;
    updatedBy?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.title = dto.title;
    this.fileName = dto.fileName;
    this.filePath = dto.filePath;
    this.scope = dto.scope;
    this.employeeId = dto.employeeId;
    this.employee = dto.employee;
    this.documentTypeId = dto.documentTypeId;
    this.documentType = dto.documentType;
    this.description = dto.description;
    this.uploadedBy = dto.uploadedBy;
    this.uploadedAt = dto.uploadedAt;
    this.expirationDate = dto.expirationDate;
    this.updatedAt = dto.updatedAt;
    this.isActive = dto.isActive ?? true;
    this.targetDepartment = dto.targetDepartment;
    this.targetBranch = dto.targetBranch;
  }
}
