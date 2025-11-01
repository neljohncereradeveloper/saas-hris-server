import { Test, TestingModule } from '@nestjs/testing';
import { FindEmployeesWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/find-employees-workexp.use-case';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmployeesWorkExpUseCase', () => {
  let useCase: FindEmployeesWorkExpUseCase;
  let workExpRepository: jest.Mocked<WorkExpRepository>;

  const mockWorkExpRecords = [
    new WorkExp({
      id: 1,
      employeeId: 1,
      desc1: 'Software Engineer at Tech Corp',
      companyId: 1,
      workexpJobTitleId: 1,
      years: '2020-2023',
      isActive: true,
    }),
    new WorkExp({
      id: 2,
      employeeId: 1,
      desc1: 'Senior Developer at Startup Inc',
      companyId: 2,
      workexpJobTitleId: 2,
      years: '2018-2020',
      isActive: true,
    }),
  ];

  beforeEach(async () => {
    const mockWorkExpRepository = {
      findEmployeesWorkExp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmployeesWorkExpUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXP,
          useValue: mockWorkExpRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEmployeesWorkExpUseCase>(
      FindEmployeesWorkExpUseCase,
    );
    workExpRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.WORKEXP);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return work experience records for a specific employee', async () => {
      // Arrange
      const employeeId = 1;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: mockWorkExpRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: mockWorkExpRecords });
    });

    it('should handle empty results', async () => {
      // Arrange
      const employeeId = 999;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const employeeId = 1;
      const mockError = new Error('Database connection failed');
      workExpRepository.findEmployeesWorkExp.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(employeeId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle negative employee ID', async () => {
      // Arrange
      const employeeId = -1;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle large employee ID', async () => {
      // Arrange
      const employeeId = 999999;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle zero employee ID', async () => {
      // Arrange
      const employeeId = 0;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle null employee ID', async () => {
      // Arrange
      const employeeId = null as any;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle undefined employee ID', async () => {
      // Arrange
      const employeeId = undefined as any;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: [],
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: [] });
    });

    it('should handle string employee ID', async () => {
      // Arrange
      const employeeId = '1' as any;
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: mockWorkExpRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: mockWorkExpRecords });
    });

    it('should handle multiple work experience records', async () => {
      // Arrange
      const employeeId = 1;
      const multipleWorkExpRecords = [
        ...mockWorkExpRecords,
        new WorkExp({
          id: 3,
          employeeId: 1,
          desc1: 'Junior Developer at Small Company',
          companyId: 3,
          workexpJobTitleId: 3,
          years: '2016-2018',
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: multipleWorkExpRecords,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: multipleWorkExpRecords });
      expect(result.data).toHaveLength(3);
    });

    it('should handle work experience with null values', async () => {
      // Arrange
      const employeeId = 1;
      const workExpWithNulls = [
        new WorkExp({
          id: 1,
          employeeId: 1,
          desc1: null as any,
          companyId: null as any,
          workexpJobTitleId: null as any,
          years: null as any,
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: workExpWithNulls,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: workExpWithNulls });
      expect(result.data[0].desc1).toBeNull();
      expect(result.data[0].companyId).toBeNull();
      expect(result.data[0].workexpJobTitleId).toBeNull();
      expect(result.data[0].years).toBeNull();
    });

    it('should handle work experience with undefined values', async () => {
      // Arrange
      const employeeId = 1;
      const workExpWithUndefineds = [
        new WorkExp({
          id: 1,
          employeeId: 1,
          desc1: undefined,
          companyId: undefined,
          workexpJobTitleId: undefined,
          years: undefined,
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: workExpWithUndefineds,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: workExpWithUndefineds });
      expect(result.data[0].desc1).toBeUndefined();
      expect(result.data[0].companyId).toBeUndefined();
      expect(result.data[0].workexpJobTitleId).toBeUndefined();
      expect(result.data[0].years).toBeUndefined();
    });

    it('should handle work experience with empty string values', async () => {
      // Arrange
      const employeeId = 1;
      const workExpWithEmptyStrings = [
        new WorkExp({
          id: 1,
          employeeId: 1,
          desc1: '',
          companyId: 1,
          workexpJobTitleId: 1,
          years: '',
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: workExpWithEmptyStrings,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: workExpWithEmptyStrings });
      expect(result.data[0].desc1).toBe('');
      expect(result.data[0].years).toBe('');
    });

    it('should handle work experience with special characters in years', async () => {
      // Arrange
      const employeeId = 1;
      const workExpWithSpecialChars = [
        new WorkExp({
          id: 1,
          employeeId: 1,
          desc1: 'Software Engineer at Tech Corp',
          companyId: 1,
          workexpJobTitleId: 1,
          years: '2020-2023 (3+ years)',
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: workExpWithSpecialChars,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: workExpWithSpecialChars });
      expect(result.data[0].years).toBe('2020-2023 (3+ years)');
    });

    it('should handle work experience with very long descriptions', async () => {
      // Arrange
      const employeeId = 1;
      const longDescription = 'A'.repeat(1000);
      const workExpWithLongDesc = [
        new WorkExp({
          id: 1,
          employeeId: 1,
          desc1: longDescription,
          companyId: 1,
          workexpJobTitleId: 1,
          years: '2020-2023',
          isActive: true,
        }),
      ];
      workExpRepository.findEmployeesWorkExp.mockResolvedValue({
        data: workExpWithLongDesc,
      });

      // Act
      const result = await useCase.execute(employeeId);

      // Assert
      expect(workExpRepository.findEmployeesWorkExp).toHaveBeenCalledWith(
        employeeId,
      );
      expect(result).toEqual({ data: workExpWithLongDesc });
      expect(result.data[0].desc1).toBe(longDescription);
    });
  });
});
