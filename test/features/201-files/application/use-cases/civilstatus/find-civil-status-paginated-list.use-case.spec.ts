import { Test, TestingModule } from '@nestjs/testing';
import { FindCivilStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/civilstatus/find-civil-status-paginated-list.use-case';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindCivilStatusWithPaginatedListUseCase', () => {
  let useCase: FindCivilStatusPaginatedListUseCase;
  let civilStatusRepository: jest.Mocked<CivilStatusRepository>;

  const mockCivilStatuses = [
    new CivilStatus({
      id: 1,
      desc1: 'Single',
      isActive: true,
    }),
    new CivilStatus({
      id: 2,
      desc1: 'Married',
      isActive: true,
    }),
    new CivilStatus({
      id: 3,
      desc1: 'Divorced',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockCivilStatuses,
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
    const mockCivilStatusRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCivilStatusPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
          useValue: mockCivilStatusRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindCivilStatusPaginatedListUseCase>(
      FindCivilStatusPaginatedListUseCase,
    );
    civilStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of civil statuses', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 10;
      civilStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
      expect(result.data).toHaveLength(3);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalRecords: 3,
        totalPages: 1,
        nextPage: null,
        previousPage: null,
      });
    });

    it('should handle empty search term', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      civilStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle different page and limit values', async () => {
      // Arrange
      const term = 'civil';
      const page = 2;
      const limit = 5;
      const customResult = {
        data: mockCivilStatuses.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      civilStatusRepository.findPaginatedList.mockResolvedValue(customResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(customResult);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.previousPage).toBe(1);
      expect(result.meta.nextPage).toBeNull();
    });

    it('should handle empty results', async () => {
      // Arrange
      const term = 'nonexistent';
      const page = 1;
      const limit = 10;
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
      civilStatusRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      civilStatusRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = 'test';
      const page = 100;
      const limit = 10;
      const largePageResult = {
        data: [],
        meta: {
          page: 100,
          limit: 10,
          totalRecords: 50,
          totalPages: 5,
          nextPage: null,
          previousPage: 99,
        },
      };
      civilStatusRepository.findPaginatedList.mockResolvedValue(
        largePageResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(largePageResult);
      expect(result.meta.page).toBe(100);
      expect(result.meta.previousPage).toBe(99);
      expect(result.meta.nextPage).toBeNull();
    });

    it('should handle zero limit', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 0;
      const zeroLimitResult = {
        data: [],
        meta: {
          page: 1,
          limit: 0,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      civilStatusRepository.findPaginatedList.mockResolvedValue(
        zeroLimitResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(zeroLimitResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'civil@#$%';
      const page = 1;
      const limit = 10;
      civilStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(civilStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
