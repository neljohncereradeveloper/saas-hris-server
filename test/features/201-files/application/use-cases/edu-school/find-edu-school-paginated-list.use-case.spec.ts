import { Test, TestingModule } from '@nestjs/testing';
import { FindEduSchoolPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-school/find-edu-school-paginated-list.use-case';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEduSchoolPaginatedListUseCase', () => {
  let useCase: FindEduSchoolPaginatedListUseCase;
  let eduSchoolRepository: jest.Mocked<EduSchoolRepository>;

  const mockEduSchools = [
    new EduSchool({
      id: 1,
      desc1: 'University of the Philippines',
      isActive: true,
    }),
    new EduSchool({
      id: 2,
      desc1: 'Ateneo de Manila University',
      isActive: true,
    }),
    new EduSchool({
      id: 3,
      desc1: 'De La Salle University',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockEduSchools,
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
    const mockEduSchoolRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEduSchoolPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
          useValue: mockEduSchoolRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEduSchoolPaginatedListUseCase>(
      FindEduSchoolPaginatedListUseCase,
    );
    eduSchoolRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of edu schools with default parameters', async () => {
      // Arrange
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
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

    it('should return paginated list of edu schools with custom parameters', async () => {
      // Arrange
      const term = 'University';
      const page = 2;
      const limit = 5;
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return empty list when no edu schools found', async () => {
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
      eduSchoolRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute('NonExistent', 1, 10);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
        'NonExistent',
        1,
        10,
      );
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle search term with special characters', async () => {
      // Arrange
      const term = "St. Mary's College";
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, 1, 10);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const limit = 1000;
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, limit);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      eduSchoolRepository.findPaginatedList.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute('', 1, 10)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null and undefined parameters', async () => {
      // Arrange
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
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
      eduSchoolRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', page, limit);

      // Assert
      expect(eduSchoolRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
