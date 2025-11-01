import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveProvinceForComboboxUseCase } from '@features/201-files/application/use-cases/province/retrieve-province-for-combobox.use-case';
import { ProvinceRepository } from '@features/201-files/domain/repositories/province.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveProvinceForComboboxUseCase', () => {
  let useCase: RetrieveProvinceForComboboxUseCase;
  let provinceRepository: jest.Mocked<ProvinceRepository>;

  const mockProvinceRecords = [
    { desc1: 'metro manila' },
    { desc1: 'cavite' },
    { desc1: 'laguna' },
    { desc1: 'rizal' },
  ];

  beforeEach(async () => {
    const mockProvinceRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveProvinceForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
          useValue: mockProvinceRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveProvinceForComboboxUseCase>(
      RetrieveProvinceForComboboxUseCase,
    );
    provinceRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.PROVINCE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted province records for combobox', async () => {
      // Arrange
      provinceRepository.retrieveForCombobox.mockResolvedValue(
        mockProvinceRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(provinceRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'metro manila', label: 'Metro manila' },
        { value: 'cavite', label: 'Cavite' },
        { value: 'laguna', label: 'Laguna' },
        { value: 'rizal', label: 'Rizal' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      provinceRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(provinceRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      provinceRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single character descriptions correctly', async () => {
      // Arrange
      const singleCharRecords = [{ desc1: 'a' }];
      provinceRepository.retrieveForCombobox.mockResolvedValue(
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
        { desc1: 'METRO MANILA' },
        { desc1: 'cavite' },
        { desc1: 'Laguna' },
      ];
      provinceRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'METRO MANILA', label: 'Metro manila' },
        { value: 'cavite', label: 'Cavite' },
        { value: 'Laguna', label: 'Laguna' },
      ]);
    });

    it('should handle descriptions with special characters', async () => {
      // Arrange
      const specialCharRecords = [
        { desc1: 'nueva-ecija' },
        { desc1: 'pampanga' },
        { desc1: 'tarlac' },
      ];
      provinceRepository.retrieveForCombobox.mockResolvedValue(
        specialCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'nueva-ecija', label: 'Nueva-ecija' },
        { value: 'pampanga', label: 'Pampanga' },
        { value: 'tarlac', label: 'Tarlac' },
      ]);
    });

    it('should handle null or undefined province names gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid province' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      provinceRepository.retrieveForCombobox.mockResolvedValue(nullData as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid province', label: 'Valid province' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
