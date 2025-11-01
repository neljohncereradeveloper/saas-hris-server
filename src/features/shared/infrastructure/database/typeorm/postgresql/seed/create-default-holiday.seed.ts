import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { HolidayEntity } from '../entities/holiday.entity';

export class SeedHoliday {
  private readonly logger = new Logger(SeedHoliday.name);

  constructor(private readonly entityManager: EntityManager) {}

  async run(): Promise<void> {
    const holidays = [
      // 2026 Regular Holidays
      {
        name: "New Year's Day",
        date: new Date('2026-01-01'),
        description: "New Year's Day",
      },
      {
        name: 'Maundy Thursday',
        date: new Date('2026-04-02'),
        description: 'Maundy Thursday',
      },
      {
        name: 'Good Friday',
        date: new Date('2026-04-03'),
        description: 'Good Friday',
      },
      {
        name: 'Araw ng Kagitingan',
        date: new Date('2026-04-09'),
        description: 'Araw ng Kagitingan (Day of Valor)',
      },
      {
        name: 'Labor Day',
        date: new Date('2026-05-01'),
        description: 'Labor Day',
      },
      {
        name: 'Independence Day',
        date: new Date('2026-06-12'),
        description: 'Independence Day',
      },
      {
        name: 'National Heroes Day',
        date: new Date('2026-08-31'),
        description: 'National Heroes Day',
      },
      {
        name: "All Saints' Day",
        date: new Date('2026-11-01'),
        description: "All Saints' Day",
      },
      {
        name: 'Bonifacio Day',
        date: new Date('2026-11-30'),
        description: 'Bonifacio Day',
      },
      {
        name: 'Christmas Day',
        date: new Date('2026-12-25'),
        description: 'Christmas Day',
      },
      {
        name: 'Rizal Day',
        date: new Date('2026-12-30'),
        description: 'Rizal Day',
      },
      // 2027 Regular Holidays (Estimated - Official proclamation pending)
      {
        name: "New Year's Day",
        date: new Date('2027-01-01'),
        description: "New Year's Day",
      },
      {
        name: 'Maundy Thursday',
        date: new Date('2027-03-25'),
        description: 'Maundy Thursday',
      },
      {
        name: 'Good Friday',
        date: new Date('2027-03-26'),
        description: 'Good Friday',
      },
      {
        name: 'Araw ng Kagitingan',
        date: new Date('2027-04-09'),
        description: 'Araw ng Kagitingan (Day of Valor)',
      },
      {
        name: 'Labor Day',
        date: new Date('2027-05-01'),
        description: 'Labor Day',
      },
      {
        name: 'Independence Day',
        date: new Date('2027-06-12'),
        description: 'Independence Day',
      },
      {
        name: 'National Heroes Day',
        date: new Date('2027-08-30'),
        description: 'National Heroes Day (Last Monday of August)',
      },
      {
        name: "All Saints' Day",
        date: new Date('2027-11-01'),
        description: "All Saints' Day",
      },
      {
        name: 'Bonifacio Day',
        date: new Date('2027-11-30'),
        description: 'Bonifacio Day',
      },
      {
        name: 'Christmas Day',
        date: new Date('2027-12-25'),
        description: 'Christmas Day',
      },
      {
        name: 'Rizal Day',
        date: new Date('2027-12-30'),
        description: 'Rizal Day',
      },
    ];

    for (const holiday of holidays) {
      const existingHoliday = await this.entityManager.findOne(HolidayEntity, {
        where: { name: holiday.name, date: holiday.date },
      });

      if (!existingHoliday) {
        const holidayEntity = this.entityManager.create(HolidayEntity, {
          name: holiday.name,
          date: holiday.date,
          description: holiday.description,
          isactive: true,
          createdby: 'auto generated',
          updatedby: 'auto generated',
        });

        await this.entityManager.save(holidayEntity);
        this.logger.log(`Created holiday: ${holiday}`);
      } else {
        this.logger.log(`Holiday already exists: ${holiday}`);
      }
    }
  }
}
