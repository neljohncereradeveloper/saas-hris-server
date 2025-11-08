import { LeaveYearConfiguration } from '@features/leave-management/domain/models/leave-year-configuration.model';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';

/**
 * Get the active cutoff configuration for a specific date
 * @param date The date to check
 * @param repository The leave year configuration repository
 * @returns The active cutoff configuration or null if none found
 */
export async function getActiveCutoffForDate(
  date: Date,
  repository: LeaveYearConfigurationRepository,
): Promise<LeaveYearConfiguration | null> {
  return repository.findActiveForDate(date);
}
