import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveLeaveTypeForComboboxUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const leaveTypes = await this.leaveTypeRepository.retrieveForCombobox();

    return leaveTypes.map((val: { name: string }) => ({
      value: val.name || '',
      label: val.name
        ? val.name.charAt(0).toUpperCase() + val.name.slice(1).toLowerCase()
        : '',
    }));
  }
}
