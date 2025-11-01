import { Test, TestingModule } from '@nestjs/testing';
import { FindEmpStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/empstatus/find-empstatus-paginated-list.use-case';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { EmpStatus } from '@features/201-files/domain/models/empstatus';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmpstatusPaginatedListUseCase', () => {
  let useCase: FindEmpStatusPaginatedListUseCase;
  let empStatusRepository: jest.Mocked<EmpStatusRepository>;

  const mockEmpStatusRecords = [
    new EmpStatus({
      id: 1,
      desc1: 'Active',
      isActive: true,
    }),
    new EmpStatus({
      id: 2,
      desc1: 'Inactive',
      isActive: false,
    }),
    new EmpStatus({
      id: 3,
      desc1: 'Suspended',
      isActive: true,
    }),
  ];

  const mockPaginatedResult = {
    data: mockEmpStatusRecords,
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
    const mockEmpStatusRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEmpStatusPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
          useValue: mockEmpStatusRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindEmpStatusPaginatedListUseCase>(
      FindEmpStatusPaginatedListUseCase,
    );
    empStatusRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated empstatus list', async () => {
      // Arrange
      const term = 'active';
      const page = 1;
      const limit = 10;
      empStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty search results', async () => {
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
      empStatusRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(emptyResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = 'active';
      const page = 1;
      const limit = 10;
      const mockError = new Error('Database connection failed');
      empStatusRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(term, page, limit)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle pagination with multiple pages', async () => {
      // Arrange
      const term = '';
      const page = 2;
      const limit = 5;
      const multiPageResult = {
        data: mockEmpStatusRecords.slice(0, 2),
        meta: {
          page: 2,
          limit: 5,
          totalRecords: 12,
          totalPages: 3,
          nextPage: 3,
          previousPage: 1,
        },
      };
      empStatusRepository.findPaginatedList.mockResolvedValue(multiPageResult);

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(multiPageResult);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const term = 'active';
      const page = 0;
      const limit = 10;
      empStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large limit values', async () => {
      // Arrange
      const term = 'active';
      const page = 1;
      const limit = 1000;
      empStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle special characters in search term', async () => {
      // Arrange
      const term = 'active-status@123';
      const page = 1;
      const limit = 10;
      empStatusRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit);

      // Assert
      expect(empStatusRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
