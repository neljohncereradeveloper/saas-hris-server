import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { DocumentType } from '@features/document-management/domain/models/document-type.model';

@Injectable()
export class FindDocumentTypePaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(
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
    const result = await this.documentTypeRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
