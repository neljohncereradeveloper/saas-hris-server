import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveBranchForComboboxUseCase } from '@features/201-files/application/use-cases/branch/retrieve-branch-for-combobox.use-case';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Branch } from '@features/201-files/domain/models/branch.model';

describe('RetrieveBranchForComboboxUseCase', () => {
  let useCase: RetrieveBranchForComboboxUseCase;
  let branchRepository: jest.Mocked<BranchRepository>;

  const mockBranchData = [
    { desc1: 'branch a', brCode: 'BR001' },
    { desc1: 'BRANCH B', brCode: 'BR002' },
    { desc1: 'Branch C', brCode: 'BR003' },
    { desc1: 'd', brCode: 'BR004' },
    { desc1: 'E', brCode: 'BR005' },
  ];

  const expectedComboboxData = [
    { value: 'branch a', label: 'Branch a' },
    { value: 'BRANCH B', label: 'Branch b' },
    { value: 'Branch C', label: 'Branch c' },
    { value: 'd', label: 'D' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockBranchRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveBranchForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
          useValue: mockBranchRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveBranchForComboboxUseCase>(
      RetrieveBranchForComboboxUseCase,
    );
    branchRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BRANCH);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted combobox data with proper capitalization', async () => {
      // Arrange
      branchRepository.retrieveForCombobox.mockResolvedValue(mockBranchData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedComboboxData);
      expect(result).toHaveLength(5);
    });

    it('should handle empty array from repository', async () => {
      // Arrange
      branchRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', async () => {
      // Arrange
      const singleItem = [{ desc1: 'single branch', brCode: 'BR001' }];
      const expectedSingle = [
        { value: 'single branch', label: 'Single branch' },
      ];
      branchRepository.retrieveForCombobox.mockResolvedValue(singleItem);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSingle);
      expect(result).toHaveLength(1);
    });

    it('should properly capitalize first letter and lowercase the rest', async () => {
      // Arrange
      const testData = [
        { desc1: 'UPPERCASE', brCode: 'BR001' },
        { desc1: 'lowercase', brCode: 'BR002' },
        { desc1: 'MiXeD cAsE', brCode: 'BR003' },
        { desc1: 'a', brCode: 'BR004' },
        { desc1: 'A', brCode: 'BR005' },
      ];
      const expectedData = [
        { value: 'UPPERCASE', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'MiXeD cAsE', label: 'Mixed case' },
        { value: 'a', label: 'A' },
        { value: 'A', label: 'A' },
      ];
      branchRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedData);
    });

    it('should handle special characters in branch names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'branch-1', brCode: 'BR001' },
        { desc1: 'branch_2', brCode: 'BR002' },
        { desc1: 'branch 3', brCode: 'BR003' },
        { desc1: 'branch@4', brCode: 'BR004' },
      ];
      const expectedSpecialChar = [
        { value: 'branch-1', label: 'Branch-1' },
        { value: 'branch_2', label: 'Branch_2' },
        { value: 'branch 3', label: 'Branch 3' },
        { value: 'branch@4', label: 'Branch@4' },
      ];
      branchRepository.retrieveForCombobox.mockResolvedValue(specialCharData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle numbers in branch names', async () => {
      // Arrange
      const numberData = [
        { desc1: 'branch 1', brCode: 'BR001' },
        { desc1: '2nd branch', brCode: 'BR002' },
        { desc1: 'branch3', brCode: 'BR003' },
      ];
      const expectedNumber = [
        { value: 'branch 1', label: 'Branch 1' },
        { value: '2nd branch', label: '2nd branch' },
        { value: 'branch3', label: 'Branch3' },
      ];
      branchRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedNumber);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      branchRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
    });

    it('should handle null or undefined values in data', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid branch', brCode: 'BR001' },
        { desc1: null, brCode: 'BR002' },
        { desc1: undefined, brCode: 'BR003' },
        { desc1: '', brCode: 'BR004' },
      ];
      branchRepository.retrieveForCombobox.mockResolvedValue(
        nullData as Branch[],
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      // The function should handle null/undefined gracefully
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        value: 'valid branch',
        label: 'Valid branch',
      });
      expect(result[1]).toEqual({
        value: '',
        label: '',
      });
      expect(result[2]).toEqual({
        value: '',
        label: '',
      });
      expect(result[3]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should maintain original value while formatting label', async () => {
      // Arrange
      const testData = [{ desc1: 'ORIGINAL VALUE', brCode: 'BR001' }];
      branchRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0].value).toBe('ORIGINAL VALUE');
      expect(result[0].label).toBe('Original value');
      expect(result[0].value).not.toBe(result[0].label);
    });

    it('should handle very long branch names', async () => {
      // Arrange
      const longName = 'a'.repeat(100);
      const longData = [{ desc1: longName, brCode: 'BR001' }];
      const expectedLong = [{ value: longName, label: 'A' + 'a'.repeat(99) }];
      branchRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(branchRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLong);
      expect(result[0].value).toHaveLength(100);
      expect(result[0].label).toHaveLength(100);
    });
  });
});
