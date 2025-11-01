import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DocumentTypeEntity } from '../entities/document-type.entity';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { DocumentType } from '@features/document-management/domain/models/document-type.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class DocumentTypeRepositoryImpl
  implements DocumentTypeRepository<EntityManager>
{
  constructor(
    @InjectRepository(DocumentTypeEntity)
    private readonly repository: Repository<DocumentTypeEntity>,
  ) {}

  async create(
    documentType: DocumentType,
    manager: EntityManager,
  ): Promise<DocumentType> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} (desc1, name) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await manager.query(query, [
      documentType.desc1,
      documentType.name,
    ]);

    const entity = result[0];
    return new DocumentType({
      id: entity.id,
      desc1: entity.desc1,
      name: entity.name,
      isActive: entity.isActive,
    });
  }

  async update(
    id: number,
    dto: Partial<DocumentType>,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} 
      SET desc1 = $1, name = $2
      WHERE id = $3
    `;
    const result = await manager.query(query, [dto.desc1, dto.name, id]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async softDelete(
    id: number,
    isActive: boolean,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} 
      SET isactive = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [isActive, id]);

    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<DocumentType | null> {
    const query = `SELECT id, desc1, name, isactive FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} WHERE id = $1 limit 1`;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new DocumentType({
      id: entity.id,
      desc1: entity.desc1,
      name: entity.name,
      isActive: entity.isactive,
    });
  }

  async findPaginatedList(
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
  }> {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (term) {
      whereClause += 'WHERE name ILIKE $' + (params.length + 1);
      params.push(`%${term}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} ${whereClause}`;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT id, desc1, name, isactive 
      FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} 
      ${whereClause}
      ORDER BY name ASC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map(
      (entity: any) =>
        new DocumentType({
          id: entity.id,
          desc1: entity.desc1,
          name: entity.name,
          isActive: entity.isactive,
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

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<DocumentType | null> {
    const query = `SELECT id, desc1,name, isactive FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} WHERE desc1 = $1 AND isactive = true`;
    const result = await manager.query(query, [desc1]);

    if (result.length === 0) return null;

    const entity = result[0];
    return new DocumentType({
      id: entity.id,
      desc1: entity.desc1,
      name: entity.name,
      isActive: entity.isactive,
    });
  }
  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<DocumentType | null> {
    const query = `SELECT id, desc1,name, isactive FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} WHERE name = $1 AND isactive = true`;
    const result = await manager.query(query, [name]);
    if (result.length === 0) return null;
    const entity = result[0];
    return new DocumentType({
      id: entity.id,
      desc1: entity.desc1,
      name: entity.name,
      isActive: entity.isactive,
    });
  }

  async retrieveForCombobox(): Promise<DocumentType[]> {
    const query = `SELECT id, desc1, name, isactive FROM ${CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE} WHERE isactive = true ORDER BY name ASC`;
    const entities = await this.repository.query(query);

    return entities.map(
      (entity: any) =>
        new DocumentType({
          id: entity.id,
          desc1: entity.desc1,
          name: entity.name,
          isActive: entity.isactive,
        }),
    );
  }
}
