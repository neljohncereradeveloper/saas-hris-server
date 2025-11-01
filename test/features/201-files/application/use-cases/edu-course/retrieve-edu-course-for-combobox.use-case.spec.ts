import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveCourseForComboboxUseCase } from '@features/201-files/application/use-cases/edu-course/retrieve-edu-course-for-combobox.use-case';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveEduCourseForComboboxUseCase', () => {
  let useCase: RetrieveCourseForComboboxUseCase;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;

  const mockEduCourseData = [
    {
      id: 1,
      desc1: 'Computer Science',
      isActive: true,
    },
    {
      id: 2,
      desc1: 'Information Technology',
      isActive: true,
    },
    {
      id: 3,
      desc1: 'Software Engineering',
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
    const mockEduCourseRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveCourseForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
          useValue: mockEduCourseRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveCourseForComboboxUseCase>(
      RetrieveCourseForComboboxUseCase,
    );
    eduCourseRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transformed edu course data for combobox', async () => {
      // Arrange
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduCourseRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        value: 'Computer Science',
        label: 'Computer science',
      });
      expect(result[1]).toEqual({
        value: 'Information Technology',
        label: 'Information technology',
      });
      expect(result[2]).toEqual({
        value: 'Software Engineering',
        label: 'Software engineering',
      });
    });

    it('should handle null desc1 values gracefully', async () => {
      // Arrange
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseData,
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
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseData,
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
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        mockEduCourseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[5]).toEqual({
        value: '',
        label: '',
      });
    });

    it('should return empty array when no edu courses found', async () => {
      // Arrange
      eduCourseRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(eduCourseRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduCourseRepository.retrieveForCombobox.mockRejectedValue(error);

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
          desc1: 'computer science',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'INFORMATION TECHNOLOGY',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'Software Engineering',
          isActive: true,
        },
      ];
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(mixedCaseData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'computer science',
        label: 'Computer science',
      });
      expect(result[1]).toEqual({
        value: 'INFORMATION TECHNOLOGY',
        label: 'Information technology',
      });
      expect(result[2]).toEqual({
        value: 'Software Engineering',
        label: 'Software engineering',
      });
    });

    it('should handle special characters in desc1', async () => {
      // Arrange
      const specialCharData = [
        {
          id: 1,
          desc1: 'C++ Programming',
          isActive: true,
        },
        {
          id: 2,
          desc1: 'C# Development',
          isActive: true,
        },
        {
          id: 3,
          desc1: 'JavaScript & TypeScript',
          isActive: true,
        },
      ];
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: 'C++ Programming',
        label: 'C++ programming',
      });
      expect(result[1]).toEqual({
        value: 'C# Development',
        label: 'C# development',
      });
      expect(result[2]).toEqual({
        value: 'JavaScript & TypeScript',
        label: 'Javascript & typescript',
      });
    });

    it('should handle very long desc1 values', async () => {
      // Arrange
      const longDescData = [
        {
          id: 1,
          desc1:
            'Very Long Course Name That Exceeds Normal Length Limits and Should Still Be Handled Properly',
          isActive: true,
        },
      ];
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(longDescData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value:
          'Very Long Course Name That Exceeds Normal Length Limits and Should Still Be Handled Properly',
        label:
          'Very long course name that exceeds normal length limits and should still be handled properly',
      });
    });

    it('should handle numeric desc1 values', async () => {
      // Arrange
      const numericDescData = [
        {
          id: 1,
          desc1: '123',
          isActive: true,
        },
        {
          id: 2,
          desc1: '456.789',
          isActive: true,
        },
      ];
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        numericDescData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result[0]).toEqual({
        value: '123',
        label: '123',
      });
      expect(result[1]).toEqual({
        value: '456.789',
        label: '456.789',
      });
    });

    it('should handle null or undefined course descriptions gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid course' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      eduCourseRepository.retrieveForCombobox.mockResolvedValue(
        nullData as any,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid course', label: 'Valid course' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
