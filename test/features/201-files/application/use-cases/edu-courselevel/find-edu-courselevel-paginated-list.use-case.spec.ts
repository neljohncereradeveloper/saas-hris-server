import { Test, TestingModule } from '@nestjs/testing';
import { FindEduCourseLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-courselevel/find-edu-courselevel-paginated-list.use-case';
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEduCourseLevelPaginatedListUseCase', () => {
  let useCase: FindEduCourseLevelPaginatedListUseCase;
  let eduCourseLevelRepository: jest.Mocked<EduCourseLevelRepository>;

  const mockEduCourseLevels = [
    new EduCourseLevel({
      id: 1,
      desc1: 'Bachelor',
      isActive: true,
    }),
    new EduCourseLevel({
      id: 2,
      desc1: 'Master',
      isActive: true,
    }),
    new EduCourseLevel({
      id: 3,
      desc1: 'PhD',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockEduCourseLevels,
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
    const mockEduCourseLevelRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEduCourseLevelPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
          useValue: mockEduCourseLevelRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEduCourseLevelPaginatedListUseCase>(
      FindEduCourseLevelPaginatedListUseCase,
    );
    eduCourseLevelRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of edu course levels with default parameters', async () => {
      // Arrange
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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

    it('should return paginated list of edu course levels with custom parameters', async () => {
      // Arrange
      const term = 'Bachelor';
      const page = 2;
      const limit = 5;
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return empty list when no edu course levels found', async () => {
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
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute('NonExistent', 1, 10);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        'NonExistent',
        1,
        10,
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle search term with special characters', async () => {
      // Arrange
      const term = "Master's Degree";
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, 1, 10);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const limit = 1000;
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, limit);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduCourseLevelRepository.findPaginatedList.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('', 1, 10)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null and undefined parameters', async () => {
      // Arrange
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduCourseLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduCourseLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
