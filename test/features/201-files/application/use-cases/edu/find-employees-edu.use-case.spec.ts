import { Test, TestingModule } from '@nestjs/testing';
import { FindEmployeesEduUseCase } from '@features/201-files/application/use-cases/edu/find-employees-edu.use-case';
import { EduRepository } from '@features/201-files/domain/repositories/edu';
import { Edu } from '@features/201-files/domain/models/edu';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmployeesEduUseCase', () => {
  let useCase: FindEmployeesEduUseCase;
  let eduRepository: jest.Mocked<EduRepository>;

  const mockEduRecords = [
    new Edu({
      id: 1,
      employeeId: 1,
      eduSchoolId: 1,
      eduLevelId: 1,
      eduCourseId: 1,
      eduCourseLevelId: 1,
      schoolYear: '2020-2021',
      isActive: true,
    }),
    new Edu({
      id: 2,
      employeeId: 1,
      eduSchoolId: 2,
      eduLevelId: 2,
      eduCourseId: 2,
      eduCourseLevelId: 2,
      schoolYear: '2021-2022',
      isActive: true,
    }),
  ];

  beforeEach(async () => {
    const mockEduRepository = {
      findEmployeesEducation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmployeesEduUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDU,
          useValue: mockEduRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEmployeesEduUseCase>(FindEmployeesEduUseCase);
    eduRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDU);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return education records for a specific employee', async () => {
      // Arrange
      const employeeId = 1;
      eduRepository.findEmployeesEducation.mockResolvedValue({ data: mockEduRecords });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(eduRepository.findEmployeesEducation).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual({ data: mockEduRecords });
    });

    it('should handle empty results', async () => {
      // Arrange
      const employeeId = 999;
      eduRepository.findEmployeesEducation.mockResolvedValue({ data: [] });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(eduRepository.findEmployeesEducation).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual({ data: [] });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const employeeId = 1;
      const mockError = new Error('Database connection failed');
      eduRepository.findEmployeesEducation.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(employeeId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle negative employee ID', async () => {
      // Arrange
      const employeeId = -1;
      eduRepository.findEmployeesEducation.mockResolvedValue({ data: [] });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(eduRepository.findEmployeesEducation).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual({ data: [] });
    });

    it('should handle large employee ID', async () => {
      // Arrange
      const employeeId = 999999;
      eduRepository.findEmployeesEducation.mockResolvedValue({ data: [] });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(eduRepository.findEmployeesEducation).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual({ data: [] });
    });
  });
});
