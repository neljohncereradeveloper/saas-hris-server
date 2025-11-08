import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import { LeaveYearConfiguration } from '@features/leave-management/domain/models/leave-year-configuration.model';

@Injectable()
export class FindLeaveYearConfigurationByYearUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION)
    private readonly leaveYearConfigurationRepository: LeaveYearConfigurationRepository,
  ) {}

  async execute(year: string): Promise<LeaveYearConfiguration | null> {
    return this.leaveYearConfigurationRepository.findByYear(year);
  }
}

