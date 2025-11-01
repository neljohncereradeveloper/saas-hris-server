import { Test, TestingModule } from '@nestjs/testing';
import { FindEduCoursePaginatedListUseCase } from '@features/201-files/application/use-cases/edu-course/find-edu-course-paginated-list.use-case';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEduCoursePaginatedListUseCase', () => {
  let useCase: FindEduCoursePaginatedListUseCase;
  let eduCourseRepository: jest.Mocked<EduCourseRepository>;

  const mockEduCourses = [
    new EduCourse({
      id: 1,
      desc1: 'Computer Science',
      isActive: true,
    }),
    new EduCourse({
      id: 2,
      desc1: 'Information Technology',
      isActive: true,
    }),
    new EduCourse({
      id: 3,
      desc1: 'Software Engineering',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockEduCourses,
    meta: {
      page: 1,
      limit: 10,
      totalRecords: 3,
      totalPages: 1,
      nextPage: null,
      previousPage: null,
    },
  };

  beforeEach(async () => {
    const mockEduCourseRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEduCoursePaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
          useValue: mockEduCourseRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEduCoursePaginatedListUseCase>(
      FindEduCoursePaginatedListUseCase,
    );
    eduCourseRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of edu courses with default parameters', async () => {
      // Arrange
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
      expect(result.data).toHaveLength(3);
      expect(result.meta.totalRecords).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should return paginated list of edu courses with custom parameters', async () => {
      // Arrange
      const term = 'Computer';
      const page = 2;
      const limit = 5;
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return empty list when no edu courses found', async () => {
      // Arrange
      const emptyResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      eduCourseRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute('NonExistent', 1, 10);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        'NonExistent',
        1,
        10,
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle search term with special characters', async () => {
      // Arrange
      const term = 'C++ Programming';
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, 1, 10);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const page = 100;
      const limit = 5;
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const limit = 1000;
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, limit);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduCourseRepository.findPaginatedList.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('', 1, 10)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null and undefined parameters', async () => {
      // Arrange
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle zero values for page and limit', async () => {
      // Arrange
      const page = 0;
      const limit = 0;
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle negative values for page and limit', async () => {
      // Arrange
      const page = -1;
      const limit = -5;
      eduCourseRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
