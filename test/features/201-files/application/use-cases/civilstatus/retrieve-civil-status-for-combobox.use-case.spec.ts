import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveCivilStatusForComboboxUseCase } from '@features/201-files/application/use-cases/civilstatus/retrieve-civil-status-for-combobox.use-case';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';

describe('RetrieveCivilStatusForComboboxUseCase', () => {
  let useCase: RetrieveCivilStatusForComboboxUseCase;
  let civilStatusRepository: jest.Mocked<CivilStatusRepository>;

  const mockCivilStatusData = [
    { desc1: 'single' },
    { desc1: 'MARRIED' },
    { desc1: 'Divorced' },
    { desc1: 'b' },
    { desc1: 'E' },
  ];

  const expectedComboboxData = [
    { value: 'single', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'b', label: 'B' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockCivilStatusRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveCivilStatusForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
          useValue: mockCivilStatusRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveCivilStatusForComboboxUseCase>(
      RetrieveCivilStatusForComboboxUseCase,
    );
    civilStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted combobox data with proper capitalization', async () => {
      // Arrange
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(
        mockCivilStatusData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedComboboxData);
      expect(result).toHaveLength(5);
    });

    it('should handle empty array from repository', async () => {
      // Arrange
      civilStatusRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', async () => {
      // Arrange
      const singleItem = [{ desc1: 'single civil status' }];
      const expectedSingle = [
        { value: 'single civil status', label: 'Single civil status' },
      ];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(singleItem);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedSingle);
      expect(result).toHaveLength(1);
    });

    it('should properly capitalize first letter and lowercase the rest', async () => {
      // Arrange
      const testData = [
        { desc1: 'UPPERCASE' },
        { desc1: 'lowercase' },
        { desc1: 'MiXeD cAsE' },
        { desc1: 'a' },
        { desc1: 'A' },
      ];
      const expectedData = [
        { value: 'UPPERCASE', label: 'Uppercase' },
        { value: 'lowercase', label: 'Lowercase' },
        { value: 'MiXeD cAsE', label: 'Mixed case' },
        { value: 'a', label: 'A' },
        { value: 'A', label: 'A' },
      ];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedData);
    });

    it('should handle special characters in civil status names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'civil-1' },
        { desc1: 'civil_2' },
        { desc1: 'civil 3' },
        { desc1: 'civil@4' },
      ];
      const expectedSpecialChar = [
        { value: 'civil-1', label: 'Civil-1' },
        { value: 'civil_2', label: 'Civil_2' },
        { value: 'civil 3', label: 'Civil 3' },
        { value: 'civil@4', label: 'Civil@4' },
      ];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle numbers in civil status names', async () => {
      // Arrange
      const numberData = [
        { desc1: 'civil 1' },
        { desc1: '2nd civil' },
        { desc1: 'civil3' },
      ];
      const expectedNumber = [
        { value: 'civil 1', label: 'Civil 1' },
        { value: '2nd civil', label: '2nd civil' },
        { value: 'civil3', label: 'Civil3' },
      ];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedNumber);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      civilStatusRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle null or undefined values in data', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid civil status' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(
        nullData as CivilStatus[],
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      // The function should handle null/undefined gracefully
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        value: 'valid civil status',
        label: 'Valid civil status',
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
      const testData = [{ desc1: 'ORIGINAL VALUE' }];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0].value).toBe('ORIGINAL VALUE');
      expect(result[0].label).toBe('Original value');
      expect(result[0].value).not.toBe(result[0].label);
    });

    it('should handle very long civil status names', async () => {
      // Arrange
      const longName = 'a'.repeat(100);
      const longData = [{ desc1: longName }];
      const expectedLong = [{ value: longName, label: 'A' + 'a'.repeat(99) }];
      civilStatusRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(civilStatusRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedLong);
      expect(result[0].value).toHaveLength(100);
      expect(result[0].label).toHaveLength(100);
    });
  });
});
