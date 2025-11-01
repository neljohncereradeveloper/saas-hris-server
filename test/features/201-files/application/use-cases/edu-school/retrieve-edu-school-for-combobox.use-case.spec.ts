import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveEduSchoolForComboboxUseCase } from '@features/201-files/application/use-cases/edu-school/retrieve-edu-school-for-combobox.use-case';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveEduSchoolForComboboxUseCase', () => {
  let useCase: RetrieveEduSchoolForComboboxUseCase;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;

  const mockEduSchoolData = [
    {
      id: 1,
      desc1: 'University of the Philippines',
      isActive: true,
    },
    {
      id: 2,
      desc1: 'Ateneo de Manila University',
      isActive: true,
    },
    {
      id: 3,
      desc1: 'De La Salle University',
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
    const mockEduSchoolRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveEduSchoolForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
          useValue: mockEduSchoolRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveEduSchoolForComboboxUseCase>(
      RetrieveEduSchoolForComboboxUseCase,
    );
    eduSchoolRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transformed edu school data for combobox', async () => {
      // Arrange
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        mockEduSchoolData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduSchoolRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        value: 'University of the Philippines',
        label: 'University of the philippines',
      });
      expect(result[1]).toEqual({
        value: 'Ateneo de Manila University',
        label: 'Ateneo de manila university',
      });
      expect(result[2]).toEqual({
        value: 'De La Salle University',
        label: 'De la salle university',
      });
    });

    it('should handle null desc1 values gracefully', async () => {
      // Arrange
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        mockEduSchoolData,
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
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        mockEduSchoolData,
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
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        mockEduSchoolData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[5]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should return empty array when no edu schools found', async () => {
      // Arrange
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduSchoolRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduSchoolRepository.retrieveForCombobox.mockRejectedValue(error);

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
          desc1: 'university of the philippines',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'ATENEO DE MANILA UNIVERSITY',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'De La Salle University',
          isActive: true,
        },
      ];
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(mixedCaseData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'university of the philippines',
        label: 'University of the philippines',
      });
      expect(result[1]).toEqual({
        value: 'ATENEO DE MANILA UNIVERSITY',
        label: 'Ateneo de manila university',
      });
      expect(result[2]).toEqual({
        value: 'De La Salle University',
        label: 'De la salle university',
      });
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharData = [
        {
          id: 1,
          desc1: "St. Mary's College",
          isActive: true,
        },
        {
          id: 2,
          desc1: 'University of the Philippines - Diliman',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'Ateneo de Manila University & DLSU',
          isActive: true,
        },
      ];
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: "St. Mary's College",
        label: "St. mary's college",
      });
      expect(result[1]).toEqual({
        value: 'University of the Philippines - Diliman',
        label: 'University of the philippines - diliman',
      });
      expect(result[2]).toEqual({
        value: 'Ateneo de Manila University & DLSU',
        label: 'Ateneo de manila university & dlsu',
      });
    });

    it('should handle very long desc1 values', async () => {
      // Arrange
      const longDescData = [
        {
          id: 1,
          desc1:
            'Very Long Education School Name That Exceeds Normal Length Limits and Should Still Be Handled Properly',
          isActive: true,
        },
      ];
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(longDescData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value:
          'Very Long Education School Name That Exceeds Normal Length Limits and Should Still Be Handled Properly',
        label:
          'Very long education school name that exceeds normal length limits and should still be handled properly',
      });
    });

    it('should handle numeric desc1 values', async () => {
      // Arrange
      const numericDescData = [
        {
          id: 1,
          desc1: 'School 1',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'School 2',
          isActive: true,
        },
      ];
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        numericDescData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'School 1',
        label: 'School 1',
      });
      expect(result[1]).toEqual({
        value: 'School 2',
        label: 'School 2',
      });
    });

    it('should handle null or undefined school descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid school' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      eduSchoolRepository.retrieveForCombobox.mockResolvedValue(
        nullData as any,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid school', label: 'Valid school' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
