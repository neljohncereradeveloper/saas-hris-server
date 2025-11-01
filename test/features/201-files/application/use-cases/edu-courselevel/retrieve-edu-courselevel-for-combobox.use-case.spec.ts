import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveEduCourseLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-courselevel/retrieve-edu-courselevel-for-combobox.use-case';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveEduCourseLevelForComboboxUseCase', () => {
  let useCase: RetrieveEduCourseLevelForComboboxUseCase;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;

  const mockEduCourseLevelData = [
    {
      id: 1,
      desc1: 'Bachelor',
      isActive: true,
    },
    {
      id: 2,
      desc1: 'Master',
      isActive: true,
    },
    {
      id: 3,
      desc1: 'PhD',
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
    const mockEduCourseLevelRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveEduCourseLevelForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveEduCourseLevelForComboboxUseCase>(
      RetrieveEduCourseLevelForComboboxUseCase,
    );
    eduCourseLevelRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transformed edu course level data for combobox', async () => {
      // Arrange
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduCourseLevelRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        value: 'Bachelor',
        label: 'Bachelor',
      });
      expect(result[1]).toEqual({
        value: 'Master',
        label: 'Master',
      });
      expect(result[2]).toEqual({
        value: 'PhD',
        label: 'Phd',
      });
    });

    it('should handle null desc1 values gracefully', async () => {
      // Arrange
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseLevelData,
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
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseLevelData,
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
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseLevelData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[5]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should return empty array when no edu course levels found', async () => {
      // Arrange
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduCourseLevelRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduCourseLevelRepository.retrieveForCombobox.mockRejectedValue(error);

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
          desc1: 'bachelor',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'MASTER',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'PhD',
          isActive: true,
        },
      ];
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'bachelor',
        label: 'Bachelor',
      });
      expect(result[1]).toEqual({
        value: 'MASTER',
        label: 'Master',
      });
      expect(result[2]).toEqual({
        value: 'PhD',
        label: 'Phd',
      });
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharData = [
        {
          id: 1,
          desc1: "Master's Degree",
          isActive: true,
        },
        {
          id: 2,
          desc1: 'PhD & Post-Doc',
          isActive: true,
        },
        {
          id: 3,
          desc1: "Associate's Degree",
          isActive: true,
        },
      ];
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: "Master's Degree",
        label: "Master's degree",
      });
      expect(result[1]).toEqual({
        value: 'PhD & Post-Doc',
        label: 'Phd & post-doc',
      });
      expect(result[2]).toEqual({
        value: "Associate's Degree",
        label: "Associate's degree",
      });
    });

    it('should handle very long desc1 values', async () => {
      // Arrange
      const longDescData = [
        {
          id: 1,
          desc1:
            'Very Long Course Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
          isActive: true,
        },
      ];
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        longDescData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value:
          'Very Long Course Level Description That Exceeds Normal Length Limits and Should Still Be Handled Properly',
        label:
          'Very long course level description that exceeds normal length limits and should still be handled properly',
      });
    });

    it('should handle numeric desc1 values', async () => {
      // Arrange
      const numericDescData = [
        {
          id: 1,
          desc1: '1st Year',
          isActive: true,
        },
        {
          id: 2,
          desc1: '2nd Year',
          isActive: true,
        },
      ];
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        numericDescData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: '1st Year',
        label: '1st year',
      });
      expect(result[1]).toEqual({
        value: '2nd Year',
        label: '2nd year',
      });
    });

    it('should handle null or undefined course level descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid course level' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      eduCourseLevelRepository.retrieveForCombobox.mockResolvedValue(
        nullData as any,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid course level', label: 'Valid course level' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
