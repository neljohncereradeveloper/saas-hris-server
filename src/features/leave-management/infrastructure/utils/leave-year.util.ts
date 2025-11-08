import { LeaveYearConfiguration } from '@features/leave-management/domain/models/leave-year-configuration.model';

/**
 * Calculate which leave year identifier a date falls into based on cutoff configuration
 * @param date The date to check
 * @param configuration The leave year configuration with cutoff dates
 * @returns The leave year identifier (e.g., "2023-2024") or null if date is outside the cutoff period
 */
export function calculateLeaveYear(
  date: Date,
  configuration: LeaveYearConfiguration,
): string | null {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const startDate = new Date(configuration.cutoffStartDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(configuration.cutoffEndDate);
  endDate.setHours(23, 59, 59, 999);

  // Check if date falls within the cutoff period
  if (checkDate >= startDate && checkDate <= endDate) {
    return configuration.year;
  }

  return null;
}

/**
 * Generate leave year identifier from cutoff dates
 * Format: "YYYY-YYYY" where first year is from cutoffStartDate and second year is from cutoffEndDate
 * @param cutoffStartDate Start date of the cutoff period
 * @param cutoffEndDate End date of the cutoff period
 * @returns Leave year identifier string (e.g., "2023-2024")
 */
export function generateLeaveYearIdentifier(
  cutoffStartDate: Date,
  cutoffEndDate: Date,
): string {
  const startYear = cutoffStartDate.getFullYear();
  const endYear = cutoffEndDate.getFullYear();
  return `${startYear}-${endYear}`;
}
