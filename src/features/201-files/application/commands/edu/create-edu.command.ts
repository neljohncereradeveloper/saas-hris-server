export interface CreateEduCommand {
  employeeId: number;
  school: string;
  eduLevel: string;
  course?: string;
  courseLevel?: string;
  schoolYear: string;
}
