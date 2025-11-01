import { Injectable } from '@nestjs/common';
import { Holiday } from '@features/shared/domain/models/holiday.model';
import { formatDate } from '@features/shared/infrastructure/utils/date.util';

@Injectable()
export class HolidayService {
  /**
   * Check if a specific date is a holiday
   */
  isHoliday(date: Date, holidays: Holiday[]): boolean {
    const dateStr = formatDate(date);
    return holidays.some((holiday) => formatDate(holiday.date) === dateStr);
  }

  /**
   * Get holidays that fall within the date range (inclusive)
   */
  getHolidaysInRange(
    holidays: Holiday[],
    startDate: Date,
    endDate: Date,
  ): Holiday[] {
    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= startDate && holidayDate <= endDate;
    });
  }

  /**
   * Calculate working days (excluding holidays) between start and end date (inclusive)
   * Returns the number of non-holiday days in the range
   */
  calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    holidays: Holiday[],
  ): number {
    // Normalize dates to midnight for comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Calculate total calendar days (inclusive)
    const diffTime = end.getTime() - start.getTime();
    const calendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Get holidays in the range
    const holidaysInRange = this.getHolidaysInRange(holidays, start, end);

    // Count working days = calendar days - holidays
    const workingDays = calendarDays - holidaysInRange.length;

    return Math.max(0, workingDays); // Ensure non-negative
  }

  /**
   * Count holidays in date range
   */
  countHolidaysInRange(
    holidays: Holiday[],
    startDate: Date,
    endDate: Date,
  ): number {
    return this.getHolidaysInRange(holidays, startDate, endDate).length;
  }
}
