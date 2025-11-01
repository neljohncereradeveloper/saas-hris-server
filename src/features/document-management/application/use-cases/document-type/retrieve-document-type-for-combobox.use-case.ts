import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';

@Injectable()
export class RetrieveDocumentTypeForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const documentTypes =
      await this.documentTypeRepository.retrieveForCombobox();

    return documentTypes.map((val: { name: string }) => ({
      value: val.name || '',
      label: val.name
        ? val.name.charAt(0).toUpperCase() + val.name.slice(1).toLowerCase()
        : '',
    }));
  }
}
