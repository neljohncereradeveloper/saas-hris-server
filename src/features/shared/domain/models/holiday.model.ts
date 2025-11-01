export class Holiday {
  id?: number;
  name: string;
  date: Date;
  description?: string;
  isActive?: boolean;

  constructor(dto: {
    id?: number;
    name: string;
    date: Date;
    description?: string;
    isActive?: boolean;
  }) {
    this.id = dto.id;
    this.name = dto.name;
    this.date = dto.date;
    this.description = dto.description;
    this.isActive = dto.isActive;
  }
}

