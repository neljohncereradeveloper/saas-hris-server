export class DocumentType {
  id?: number;
  name: string;
  desc1: string; // e.g., 'Contract', 'Policy', 'Memo', 'Certificate', 'Training Material', 'HR Form'
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    desc1: string;
    isActive?: boolean;
    name: string;
  }) {
    this.id = dto.id;
    this.desc1 = dto.desc1;
    this.isActive = dto.isActive ?? true;
    this.name = dto.name;
  }
}
