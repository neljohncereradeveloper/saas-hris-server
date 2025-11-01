import { Module } from '@nestjs/common';
import { DocumentTypeModule } from './document-type/document-type.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [DocumentTypeModule, DocumentModule],
})
export class CoreDocumentManagementModule {}
