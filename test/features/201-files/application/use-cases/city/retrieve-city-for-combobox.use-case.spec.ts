import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveCityForComboboxUseCase } from '@features/201-files/application/use-cases/city/retrieve-city-for-combobox.use-case';
import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { City } from '@features/201-files/domain/models/city.model';

describe('RetrieveCityForComboboxUseCase', () => {
  let useCase: RetrieveCityForComboboxUseCase;
  let cityRepository: jest.Mocked<CityRepository>;

  const mockCityData = [
    { desc1: 'manila' },
    { desc1: 'QUEZON CITY' },
    { desc1: 'Cebu City' },
    { desc1: 'd' },
    { desc1: 'E' },
  ];

  const expectedComboboxData = [
    { value: 'manila', label: 'Manila' },
    { value: 'QUEZON CITY', label: 'Quezon city' },
    { value: 'Cebu City', label: 'Cebu city' },
    { value: 'd', label: 'D' },
    { value: 'E', label: 'E' },
  ];

  beforeEach(async () => {
    const mockCityRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveCityForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CITY,
          useValue: mockCityRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveCityForComboboxUseCase>(
      RetrieveCityForComboboxUseCase,
    );
    cityRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CITY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted combobox data with proper capitalization', async () => {
      // Arrange
      cityRepository.retrieveForCombobox.mockResolvedValue(mockCityData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedComboboxData);
      expect(result).toHaveLength(5);
    });

    it('should handle empty array from repository', async () => {
      // Arrange
      cityRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', async () => {
      // Arrange
      const singleItem = [{ desc1: 'single city' }];
      const expectedSingle = [{ value: 'single city', label: 'Single city' }];
      cityRepository.retrieveForCombobox.mockResolvedValue(singleItem);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
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
      cityRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedData);
    });

    it('should handle special characters in city names', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'city-1' },
        { desc1: 'city_2' },
        { desc1: 'city 3' },
        { desc1: 'city@4' },
      ];
      const expectedSpecialChar = [
        { value: 'city-1', label: 'City-1' },
        { value: 'city_2', label: 'City_2' },
        { value: 'city 3', label: 'City 3' },
        { value: 'city@4', label: 'City@4' },
      ];
      cityRepository.retrieveForCombobox.mockResolvedValue(specialCharData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedSpecialChar);
    });

    it('should handle numbers in city names', async () => {
      // Arrange
      const numberData = [
        { desc1: 'city 1' },
        { desc1: '2nd city' },
        { desc1: 'city3' },
      ];
      const expectedNumber = [
        { value: 'city 1', label: 'City 1' },
        { value: '2nd city', label: '2nd city' },
        { value: 'city3', label: 'City3' },
      ];
      cityRepository.retrieveForCombobox.mockResolvedValue(numberData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedNumber);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      cityRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
    });

    it('should handle null or undefined values in data', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid city' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      cityRepository.retrieveForCombobox.mockResolvedValue(nullData as City[]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      // The function should handle null/undefined gracefully
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        value: 'valid city',
        label: 'Valid city',
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
      cityRepository.retrieveForCombobox.mockResolvedValue(testData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0].value).toBe('ORIGINAL VALUE');
      expect(result[0].label).toBe('Original value');
      expect(result[0].value).not.toBe(result[0].label);
    });

    it('should handle very long city names', async () => {
      // Arrange
      const longName = 'a'.repeat(100);
      const longData = [{ desc1: longName }];
      const expectedLong = [{ value: longName, label: 'A' + 'a'.repeat(99) }];
      cityRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(cityRepository.retrieveForCombobox).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLong);
      expect(result[0].value).toHaveLength(100);
      expect(result[0].label).toHaveLength(100);
    });
  });
});
