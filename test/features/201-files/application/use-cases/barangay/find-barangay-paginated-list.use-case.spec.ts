import { Test, TestingModule } from '@nestjs/testing';
import { FindBarangayPaginatedListUseCase } from '@features/201-files/application/use-cases/barangay/find-barangay-paginated-list.use-case';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';
import { Barangay } from '@features/201-files/domain/models/barangay.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindBarangayPaginatedListUseCase', () => {
  let useCase: FindBarangayPaginatedListUseCase;
  let barangayRepository: jest.Mocked<BarangayRepository>;

  const mockBarangays = [
    new Barangay({
      id: 1,
      desc1: 'Barangay A',
      isActive: true,
    }),
    new Barangay({
      id: 2,
      desc1: 'Barangay B',
      isActive: true,
    }),
    new Barangay({
      id: 3,
      desc1: 'Barangay C',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockBarangays,
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
    const mockBarangayRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindBarangayPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.BARANGAY,
          useValue: mockBarangayRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindBarangayPaginatedListUseCase>(
      FindBarangayPaginatedListUseCase,
    );
    barangayRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.BARANGAY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of barangays', async () => {
      // Arrange
      const term = 'test';
      const page = 1;
      const limit = 10;
      barangayRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
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
      barangayRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle different page and limit values', async () => {
      // Arrange
      const term = 'barangay';
      const page = 2;
      const limit = 5;
      const customResult = {
        data: mockBarangays.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 7,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      barangayRepository.findPaginatedList.mockResolvedValue(customResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
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
      barangayRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
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
      barangayRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
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
      barangayRepository.findPaginatedList.mockResolvedValue(largePageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
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
      barangayRepository.findPaginatedList.mockResolvedValue(zeroLimitResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(zeroLimitResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'barangay@#$%';
      const page = 1;
      const limit = 10;
      barangayRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(barangayRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
