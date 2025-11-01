import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveReligionForComboboxUseCase } from '@features/201-files/application/use-cases/religion/retrieve-religion-for-combobox.use-case';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveReligionForComboboxUseCase', () => {
  let useCase: RetrieveReligionForComboboxUseCase;
  let religionRepository: jest.Mocked<ReligionRepository>;

  const mockReligionRecords = [
    { desc1: 'catholic' },
    { desc1: 'protestant' },
    { desc1: 'islam' },
    { desc1: 'buddhism' },
  ];

  beforeEach(async () => {
    const mockReligionRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveReligionForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
          useValue: mockReligionRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveReligionForComboboxUseCase>(
      RetrieveReligionForComboboxUseCase,
    );
    religionRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.RELIGION);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted religion records for combobox', async () => {
      // Arrange
      religionRepository.retrieveForCombobox.mockResolvedValue(
        mockReligionRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(religionRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'catholic', label: 'Catholic' },
        { value: 'protestant', label: 'Protestant' },
        { value: 'islam', label: 'Islam' },
        { value: 'buddhism', label: 'Buddhism' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      religionRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(religionRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      religionRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single character descriptions correctly', async () => {
      // Arrange
      const singleCharRecords = [{ desc1: 'a' }];
      religionRepository.retrieveForCombobox.mockResolvedValue(
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
        { desc1: 'CATHOLIC' },
        { desc1: 'protestant' },
        { desc1: 'Islam' },
      ];
      religionRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'CATHOLIC', label: 'Catholic' },
        { value: 'protestant', label: 'Protestant' },
        { value: 'Islam', label: 'Islam' },
      ]);
    });

    it('should handle descriptions with special characters', async () => {
      // Arrange
      const specialCharRecords = [
        { desc1: "jehovah's witnesses" },
        { desc1: 'seventh-day adventist' },
        { desc1: 'church of jesus christ' },
      ];
      religionRepository.retrieveForCombobox.mockResolvedValue(
        specialCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: "jehovah's witnesses", label: "Jehovah's witnesses" },
        { value: 'seventh-day adventist', label: 'Seventh-day adventist' },
        { value: 'church of jesus christ', label: 'Church of jesus christ' },
      ]);
    });

    it('should handle null or undefined religion names gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid religion' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      religionRepository.retrieveForCombobox.mockResolvedValue(nullData as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid religion', label: 'Valid religion' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
