export interface CreateTrainingCommand {
  trainingDate: Date;
  empTrainingsCertificate: string;
  employeeId: number;
  trainingTitle?: string;
  desc1?: string;
}
