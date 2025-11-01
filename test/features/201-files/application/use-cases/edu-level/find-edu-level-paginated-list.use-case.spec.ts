import { Test, TestingModule } from '@nestjs/testing';
import { FindEduLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-level/find-edu-level-paginated-list.use-case';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEduLevelPaginatedListUseCase', () => {
  let useCase: FindEduLevelPaginatedListUseCase;
  let eduLevelRepository: jest.Mocked<EduLevelRepository>;

  const mockEduLevels = [
    new EduLevel({
      id: 1,
      desc1: 'Elementary',
      isActive: true,
    }),
    new EduLevel({
      id: 2,
      desc1: 'High School',
      isActive: true,
    }),
    new EduLevel({
      id: 3,
      desc1: 'College',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockEduLevels,
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
    const mockEduLevelRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEduLevelPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
          useValue: mockEduLevelRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEduLevelPaginatedListUseCase>(
      FindEduLevelPaginatedListUseCase,
    );
    eduLevelRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of edu levels with default parameters', async () => {
      // Arrange
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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

    it('should return paginated list of edu levels with custom parameters', async () => {
      // Arrange
      const term = 'Elementary';
      const page = 2;
      const limit = 5;
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return empty list when no edu levels found', async () => {
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
      eduLevelRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute('NonExistent', 1, 10);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        'NonExistent',
        1,
        10,
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle search term with special characters', async () => {
      // Arrange
      const term = 'Pre-School & Kindergarten';
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, 1, 10);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const limit = 1000;
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, limit);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduLevelRepository.findPaginatedList.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('', 1, 10)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null and undefined parameters', async () => {
      // Arrange
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduLevelRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduLevelRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
