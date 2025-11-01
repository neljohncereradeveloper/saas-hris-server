import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Document } from '@features/document-management/domain/models/document.model';
import { DocumentRepository } from '@features/document-management/domain/repositories/document.repository';

@Injectable()
export class FindDocumentPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(
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
    const result = await this.documentRepository.findPaginatedList(
      term,
      page,
      limit,
    );

    return result;
  }
}
