import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveEduLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-level/retrieve-edu-level-for-combobox.use-case';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveEduLevelForComboboxUseCase', () => {
  let useCase: RetrieveEduLevelForComboboxUseCase;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;

  const mockEduLevelData = [
    {
      id: 1,
      desc1: 'Elementary',
      isActive: true,
    },
    {
      id: 2,
      desc1: 'High School',
      isActive: true,
    },
    {
      id: 3,
      desc1: 'College',
      isActive: false,
    },
    {
      id: 4,
      desc1: '', // Test empty string handling
      isActive: true,
    },
    {
      id: 5,
      desc1: '', // Test empty string handling
      isActive: true,
    },
    {
      id: 6,
      desc1: '', // Test empty string handling
      isActive: true,
    },
  ];

  beforeEach(async () => {
    const mockEduLevelRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveEduLevelForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
          useValue: mockEduLevelRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveEduLevelForComboboxUseCase>(
      RetrieveEduLevelForComboboxUseCase,
    );
    eduLevelRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transformed edu level data for combobox', async () => {
      // Arrange
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduLevelRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        value: 'Elementary',
        label: 'Elementary',
      });
      expect(result[1]).toEqual({
        value: 'High School',
        label: 'High school',
      });
      expect(result[2]).toEqual({
        value: 'College',
        label: 'College',
      });
    });

    it('should handle null desc1 values gracefully', async () => {
      // Arrange
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[3]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should handle undefined desc1 values gracefully', async () => {
      // Arrange
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[4]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should handle empty string desc1 values', async () => {
      // Arrange
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[5]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should return empty array when no edu levels found', async () => {
      // Arrange
      eduLevelRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduLevelRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduLevelRepository.retrieveForCombobox.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle mixed case desc1 values', async () => {
      // Arrange
      const mixedCaseData = [
        {
          id: 1,
          desc1: 'elementary',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'HIGH SCHOOL',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'College',
          isActive: true,
        },
      ];
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(mixedCaseData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'elementary',
        label: 'Elementary',
      });
      expect(result[1]).toEqual({
        value: 'HIGH SCHOOL',
        label: 'High school',
      });
      expect(result[2]).toEqual({
        value: 'College',
        label: 'College',
      });
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharData = [
        {
          id: 1,
          desc1: 'Pre-School & Kindergarten',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'Post-Graduate Studies',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'Technical & Vocational',
          isActive: true,
        },
      ];
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(specialCharData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'Pre-School & Kindergarten',
        label: 'Pre-school & kindergarten',
      });
      expect(result[1]).toEqual({
        value: 'Post-Graduate Studies',
        label: 'Post-graduate studies',
      });
      expect(result[2]).toEqual({
        value: 'Technical & Vocational',
        label: 'Technical & vocational',
      });
    });

    it('should handle very long desc1 values', async () => {
      // Arrange
      const longDescData = [
        {
          id: 1,
          desc1:
            'Very Long Education Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
          isActive: true,
        },
      ];
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(longDescData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value:
          'Very Long Education Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
        label:
          'Very long education level description that exceeds normal length limits and should still be handled properly',
      });
    });

    it('should handle numeric desc1 values', async () => {
      // Arrange
      const numericDescData = [
        {
          id: 1,
          desc1: '1st Grade',
          isActive: true,
        },
        {
          id: 2,
          desc1: '2nd Year',
          isActive: true,
        },
      ];
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(numericDescData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: '1st Grade',
        label: '1st grade',
      });
      expect(result[1]).toEqual({
        value: '2nd Year',
        label: '2nd year',
      });
    });

    it('should handle null or undefined education level descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid education level' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      eduLevelRepository.retrieveForCombobox.mockResolvedValue(nullData as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid education level', label: 'Valid education level' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
