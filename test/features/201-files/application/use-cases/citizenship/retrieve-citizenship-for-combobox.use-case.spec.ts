import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveCitizenshipForComboboxUseCase } from '@features/201-files/application/use-cases/citizenship/retrieve-citizenship-for-combobox.use-case';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';

describe('RetrieveCitizenshipForComboboxUseCase', () => {
  let useCase: RetrieveCitizenshipForComboboxUseCase;
  let citizenshipRepository: jest.Mocked<CitizenShipRepository>;

  const mockCitizenshipData = [
    { desc1: 'filipino' },
    { desc1: 'AMERICAN' },
    { desc1: 'Canadian' },
    { desc1: 'b' },
    { desc1: 'E' },
  ];

  const expectedComboboxData = [
    { value: 'filipino', label: 'Filipino' },
    { value: 'AMERICAN', label: 'American' },
    { value: 'Canadian', label: 'Canadian' },
    { value: 'b', label: 'B' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockCitizenshipRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveCitizenshipForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP,
          useValue: mockCitizenshipRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveCitizenshipForComboboxUseCase>(
      RetrieveCitizenshipForComboboxUseCase,
    );
    citizenshipRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted combobox data with proper capitalization', async () => {
      // Arrange
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(
        mockCitizenshipData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedComboboxData);
      expect(result).toHaveLength(5);
    });

    it('should handle empty array from repository', async () => {
      // Arrange
      citizenshipRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', async () => {
      // Arrange
      const singleItem = [{ desc1: 'single citizenship' }];
      const expectedSingle = [
        { value: 'single citizenship', label: 'Single citizenship' },
      ];
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(singleItem);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
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
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedData);
    });

    it('should handle special characters in citizenship names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'citizenship-1' },
        { desc1: 'citizenship_2' },
        { desc1: 'citizenship 3' },
        { desc1: 'citizenship@4' },
      ];
      const expectedSpecialChar = [
        { value: 'citizenship-1', label: 'Citizenship-1' },
        { value: 'citizenship_2', label: 'Citizenship_2' },
        { value: 'citizenship 3', label: 'Citizenship 3' },
        { value: 'citizenship@4', label: 'Citizenship@4' },
      ];
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle numbers in citizenship names', async () => {
      // Arrange
      const numberData = [
        { desc1: 'citizenship 1' },
        { desc1: '2nd citizenship' },
        { desc1: 'citizenship3' },
      ];
      const expectedNumber = [
        { value: 'citizenship 1', label: 'Citizenship 1' },
        { value: '2nd citizenship', label: '2nd citizenship' },
        { value: 'citizenship3', label: 'Citizenship3' },
      ];
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedNumber);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      citizenshipRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle null or undefined values in data', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid citizenship' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(
        nullData as CitizenShip[],
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      // The function should handle null/undefined gracefully
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        value: 'valid citizenship',
        label: 'Valid citizenship',
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
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0].value).toBe('ORIGINAL VALUE');
      expect(result[0].label).toBe('Original value');
      expect(result[0].value).not.toBe(result[0].label);
    });

    it('should handle very long citizenship names', async () => {
      // Arrange
      const longName = 'a'.repeat(100);
      const longData = [{ desc1: longName }];
      const expectedLong = [{ value: longName, label: 'A' + 'a'.repeat(99) }];
      citizenshipRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(citizenshipRepository.retrieveForCombobox).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toEqual(expectedLong);
      expect(result[0].value).toHaveLength(100);
      expect(result[0].label).toHaveLength(100);
    });
  });
});
