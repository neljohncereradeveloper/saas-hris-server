export interface CreateReferenceCommand {
  employeeId: number;
  fname: string;
  mname?: string;
  lname: string;
  suffix?: string;
  cellphoneNumber?: string;
}
