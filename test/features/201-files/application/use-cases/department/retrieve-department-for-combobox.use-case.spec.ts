import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveDepartmentForComboboxUseCase } from '@features/201-files/application/use-cases/department/retrieve-department-for-combobox.use-case';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveDepartmentForComboboxUseCase', () => {
  let useCase: RetrieveDepartmentForComboboxUseCase;
  let departmentRepository: jest.Mocked<DepartmentRepository>;

  const mockDepartmentData = [
    { desc1: 'department a', code: 'DEPT001', designation: 'Dept A' },
    { desc1: 'DEPARTMENT B', code: 'DEPT002', designation: 'Dept B' },
    { desc1: 'Department C', code: 'DEPT003', designation: 'Dept C' },
    { desc1: 'd', code: 'DEPT004', designation: 'Dept D' },
    { desc1: 'E', code: 'DEPT005', designation: 'Dept E' },
  ];

  const expectedComboboxData = [
    { value: 'department a', label: 'Department a' },
    { value: 'DEPARTMENT B', label: 'Department b' },
    { value: 'Department C', label: 'Department c' },
    { value: 'd', label: 'D' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockDepartmentRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveDepartmentForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
          useValue: mockDepartmentRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveDepartmentForComboboxUseCase>(
      RetrieveDepartmentForComboboxUseCase,
    );
    departmentRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transformed department data for combobox', async () => {
      // Arrange
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        mockDepartmentData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedComboboxData);
    });

    it('should handle empty department data', async () => {
      // Arrange
      departmentRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle single department', async () => {
      // Arrange
      const singleDepartment = [
        { desc1: 'single dept', code: 'SINGLE', designation: 'Single' },
      ];
      const expectedSingle = [{ value: 'single dept', label: 'Single dept' }];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        singleDepartment,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSingle);
    });

    it('should handle department with null desc1', async () => {
      // Arrange
      const departmentWithNull = [
        { desc1: '', code: 'NULL', designation: 'Null' },
        { desc1: 'valid dept', code: 'VALID', designation: 'Valid' },
      ];
      const expectedWithNull = [
        { value: '', label: '' },
        { value: 'valid dept', label: 'Valid dept' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        departmentWithNull,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedWithNull);
    });

    it('should handle department with undefined desc1', async () => {
      // Arrange
      const departmentWithUndefined = [
        { desc1: '', code: 'UNDEF', designation: 'Undefined' },
        { desc1: 'valid dept', code: 'VALID', designation: 'Valid' },
      ];
      const expectedWithUndefined = [
        { value: '', label: '' },
        { value: 'valid dept', label: 'Valid dept' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        departmentWithUndefined,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedWithUndefined);
    });

    it('should handle department with empty string desc1', async () => {
      // Arrange
      const departmentWithEmpty = [
        { desc1: '', code: 'EMPTY', designation: 'Empty' },
        { desc1: 'valid dept', code: 'VALID', designation: 'Valid' },
      ];
      const expectedWithEmpty = [
        { value: '', label: '' },
        { value: 'valid dept', label: 'Valid dept' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        departmentWithEmpty,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedWithEmpty);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      departmentRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle mixed case department names', async () => {
      // Arrange
      const mixedCaseData = [
        { desc1: 'MiXeD cAsE', code: 'MIXED', designation: 'Mixed' },
        { desc1: 'lowercase', code: 'LOWER', designation: 'Lower' },
        { desc1: 'UPPERCASE', code: 'UPPER', designation: 'Upper' },
      ];
      const expectedMixedCase = [
        { value: 'MiXeD cAsE', label: 'Mixed case' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'UPPERCASE', label: 'Uppercase' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(mixedCaseData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMixedCase);
    });

    it('should handle special characters in department names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'Dept-Name', code: 'DEPT1', designation: 'Dept 1' },
        { desc1: 'Dept_Name', code: 'DEPT2', designation: 'Dept 2' },
        { desc1: 'Dept.Name', code: 'DEPT3', designation: 'Dept 3' },
      ];
      const expectedSpecialChar = [
        { value: 'Dept-Name', label: 'Dept-name' },
        { value: 'Dept_Name', label: 'Dept_name' },
        { value: 'Dept.Name', label: 'Dept.name' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle very long department names', async () => {
      // Arrange
      const longNameData = [
        {
          desc1: 'Very Long Department Name That Exceeds Normal Length',
          code: 'LONG',
          designation: 'Long Dept',
        },
      ];
      const expectedLongName = [
        {
          value: 'Very Long Department Name That Exceeds Normal Length',
          label: 'Very long department name that exceeds normal length',
        },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(longNameData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(departmentRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLongName);
    });

    it('should handle null or undefined department descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid department' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      departmentRepository.retrieveForCombobox.mockResolvedValue(
        nullData as any,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid department', label: 'Valid department' },
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
