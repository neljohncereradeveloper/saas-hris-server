import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveBarangayForComboboxUseCase } from '@features/201-files/application/use-cases/barangay/retrieve-barangay-for-combobox.use-case';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Barangay } from '@features/201-files/domain/models/barangay.model';

describe('RetrieveBarangayForComboboxUseCase', () => {
  let useCase: RetrieveBarangayForComboboxUseCase;
  let barangayRepository: jest.Mocked<BarangayRepository>;

  const mockBarangayData = [
    { desc1: 'barangay a' },
    { desc1: 'BARANGAY B' },
    { desc1: 'Barangay C' },
    { desc1: 'd' },
    { desc1: 'E' },
  ];

  const expectedComboboxData = [
    { value: 'barangay a', label: 'Barangay a' },
    { value: 'BARANGAY B', label: 'Barangay b' },
    { value: 'Barangay C', label: 'Barangay c' },
    { value: 'd', label: 'D' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockBarangayRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveBarangayForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BARANGAY,
          useValue: mockBarangayRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveBarangayForComboboxUseCase>(
      RetrieveBarangayForComboboxUseCase,
    );
    barangayRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BARANGAY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted combobox data with proper capitalization', async () => {
      // Arrange
      barangayRepository.retrieveForCombobox.mockResolvedValue(
        mockBarangayData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedComboboxData);
      expect(result).toHaveLength(5);
    });

    it('should handle empty array from repository', async () => {
      // Arrange
      barangayRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', async () => {
      // Arrange
      const singleItem = [{ desc1: 'single barangay' }];
      const expectedSingle = [
        { value: 'single barangay', label: 'Single barangay' },
      ];
      barangayRepository.retrieveForCombobox.mockResolvedValue(singleItem);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
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
      barangayRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedData);
    });

    it('should handle special characters in barangay names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'barangay-1' },
        { desc1: 'barangay_2' },
        { desc1: 'barangay 3' },
        { desc1: 'barangay@4' },
      ];
      const expectedSpecialChar = [
        { value: 'barangay-1', label: 'Barangay-1' },
        { value: 'barangay_2', label: 'Barangay_2' },
        { value: 'barangay 3', label: 'Barangay 3' },
        { value: 'barangay@4', label: 'Barangay@4' },
      ];
      barangayRepository.retrieveForCombobox.mockResolvedValue(specialCharData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle numbers in barangay names', async () => {
      // Arrange
      const numberData = [
        { desc1: 'barangay 1' },
        { desc1: '2nd barangay' },
        { desc1: 'barangay3' },
      ];
      const expectedNumber = [
        { value: 'barangay 1', label: 'Barangay 1' },
        { value: '2nd barangay', label: '2nd barangay' },
        { value: 'barangay3', label: 'Barangay3' },
      ];
      barangayRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedNumber);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      barangayRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
    });

    it('should handle null or undefined values in data', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid barangay' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      barangayRepository.retrieveForCombobox.mockResolvedValue(
        nullData as Barangay[],
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      // The function should handle null/undefined gracefully
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        value: 'valid barangay',
        label: 'Valid barangay',
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
      barangayRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0].value).toBe('ORIGINAL VALUE');
      expect(result[0].label).toBe('Original value');
      expect(result[0].value).not.toBe(result[0].label);
    });

    it('should handle very long barangay names', async () => {
      // Arrange
      const longName = 'a'.repeat(100);
      const longData = [{ desc1: longName }];
      const expectedLong = [{ value: longName, label: 'A' + 'a'.repeat(99) }];
      barangayRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(barangayRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLong);
      expect(result[0].value).toHaveLength(100);
      expect(result[0].label).toHaveLength(100);
    });
  });
});
