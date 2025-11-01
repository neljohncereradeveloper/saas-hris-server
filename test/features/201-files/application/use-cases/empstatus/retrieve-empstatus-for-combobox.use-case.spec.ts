import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveEmpStatusForComboboxUseCase } from '@features/201-files/application/use-cases/empstatus/retrieve-empstatus-for-combobox.use-case';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveEmpstatusForComboboxUseCase', () => {
  let useCase: RetrieveEmpStatusForComboboxUseCase;
  let empStatusRepository: jest.Mocked<EmpStatusRepository>;

  const mockEmpStatusRecords = [
    { desc1: 'active' },
    { desc1: 'inactive' },
    { desc1: 'suspended' },
    { desc1: 'terminated' },
  ];

  beforeEach(async () => {
    const mockEmpStatusRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveEmpStatusForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
          useValue: mockEmpStatusRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveEmpStatusForComboboxUseCase>(
      RetrieveEmpStatusForComboboxUseCase,
    );
    empStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted empstatus records for combobox', async () => {
      // Arrange
      empStatusRepository.retrieveForCombobox.mockResolvedValue(
        mockEmpStatusRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(empStatusRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'terminated', label: 'Terminated' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      empStatusRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(empStatusRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      empStatusRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single character descriptions correctly', async () => {
      // Arrange
      const singleCharRecords = [{ desc1: 'a' }];
      empStatusRepository.retrieveForCombobox.mockResolvedValue(
        singleCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([{ value: 'a', label: 'A' }]);
    });

    it('should handle mixed case descriptions', async () => {
      // Arrange
      const mixedCaseRecords = [
        { desc1: 'ACTIVE' },
        { desc1: 'inactive' },
        { desc1: 'Suspended' },
      ];
      empStatusRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'ACTIVE', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ]);
    });

    it('should handle descriptions with special characters', async () => {
      // Arrange
      const specialCharRecords = [
        { desc1: 'on-leave' },
        { desc1: 'part-time' },
        { desc1: 'temp_employee' },
      ];
      empStatusRepository.retrieveForCombobox.mockResolvedValue(
        specialCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'on-leave', label: 'On-leave' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'temp_employee', label: 'Temp_employee' },
      ]);
    });

    it('should handle null or undefined empstatus descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid empstatus' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      empStatusRepository.retrieveForCombobox.mockResolvedValue(
        nullData as any,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid empstatus', label: 'Valid empstatus' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
