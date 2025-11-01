import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { DocumentRepository } from '@features/document-management/domain/repositories/document.repository';
import { DocumentEntity } from '../entities/document.entity';
import { Document } from '@features/document-management/domain/models/document.model';

@Injectable()
export class DocumentRepositoryImpl
  implements DocumentRepository<EntityManager>
{
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repository: Repository<DocumentEntity>,
  ) {}

  async create(dto: Document, manager: EntityManager): Promise<Document> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.DOCUMENT} 
      (title, scope, employeeid, documenttypeid, description, expirationdate, targetdepartment, targetbranch, uploadedby, uploadedat, filename, filepath) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, $11) 
      RETURNING *
    `;
    const result = await manager.query(query, [
      dto.title,
      dto.scope,
      dto.employeeId,
      dto.documentTypeId,
      dto.description,
      dto.expirationDate,
      dto.targetDepartment,
      dto.targetBranch,
      dto.uploadedBy,
      dto.fileName,
      dto.filePath,
    ]);

    const entity = result[0];
    return new Document({
      id: entity.id,
      title: entity.title,
      scope: entity.scope,
      employeeId: entity.employeeid,
      documentTypeId: entity.documenttypeid,
      description: entity.description,
      expirationDate: entity.expirationdate,
      targetDepartment: entity.targetdepartment,
      targetBranch: entity.targetbranch,
      uploadedBy: entity.uploadedby,
      uploadedAt: entity.uploadedat,
      fileName: entity.filename,
      filePath: entity.filepath,
    });
  }

  async update(
    id: number,
    dto: Partial<Document>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.DOCUMENT} 
      SET title = $1, scope = $2, documenttypeid = $3, 
      description = $4, expirationdate = $5, targetdepartment = $6, targetbranch = $7, 
      updatedby = $8, updatedat = CURRENT_TIMESTAMP
      WHERE id = $9
    `;
    const result = await manager.query(query, [
      dto.title,
      dto.scope,
      dto.documentTypeId,
      dto.description,
      dto.expirationDate,
      dto.targetDepartment,
      dto.targetBranch,
      dto.updatedBy,
      id,
    ]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.DOCUMENT} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);

    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Document | null> {
    const query = `SELECT 
    d.id, d.title, d.scope, d.employeeid, dt.desc1 as documenttype, d.description, 
    d.expirationdate, d.targetdepartment, d.targetbranch, 
    d.uploadedby, d.uploadedat, d.updatedby, d.updatedat, d.filename, d.filepath, d.isactive 
    FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT} as d
    LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} as dt ON d.documenttypeid = dt.id
    WHERE d.id = $1 limit 1`;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new Document({
      id: entity.id,
      title: entity.title,
      scope: entity.scope,
      employeeId: entity.employeeid,
      documentType: entity.documenttype,
      description: entity.description,
      expirationDate: entity.expirationdate,
      targetDepartment: entity.targetdepartment,
      targetBranch: entity.targetbranch,
      uploadedBy: entity.uploadedby,
      uploadedAt: entity.uploadedat,
      updatedBy: entity.updatedby,
      updatedAt: entity.updatedat,
      isActive: entity.isactive,
      fileName: entity.filename,
      filePath: entity.filepath,
    });
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
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
  }> {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (term) {
      whereClause += 'WHERE title ILIKE $' + (params.length + 1);
      params.push(`%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT} ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT 
      d.id, d.title, d.scope, d.employeeid, dt.desc1 as documenttype, d.description, 
      d.expirationdate, d.targetdepartment, d.targetbranch, 
      d.uploadedby, d.uploadedat, d.updatedby, d.updatedat, d.filename, d.filepath, d.isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT} as d
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} as dt ON d.documenttypeid = dt.id
      ${whereClause}
      ORDER BY d.title ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new Document({
          id: entity.id,
          title: entity.title,
          scope: entity.scope,
          employeeId: entity.employeeid,
          documentType: entity.documenttype,
          description: entity.description,
          expirationDate: entity.expirationdate,
          targetDepartment: entity.targetdepartment,
          targetBranch: entity.targetbranch,
          uploadedBy: entity.uploadedby,
          uploadedAt: entity.uploadedat,
          updatedBy: entity.updatedby,
          updatedAt: entity.updatedat,
          isActive: entity.isactive,
          fileName: entity.filename,
          filePath: entity.filepath,
        }),
    );

    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }
}
