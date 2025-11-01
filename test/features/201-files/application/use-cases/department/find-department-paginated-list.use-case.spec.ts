import { Test, TestingModule } from '@nestjs/testing';
import { FindDepartmentPaginatedListUseCase } from '@features/201-files/application/use-cases/department/find-department-paginated-list.use-case';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Dept } from '@features/201-files/domain/models/dept';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindDepartmentPaginatedListUseCase', () => {
  let useCase: FindDepartmentPaginatedListUseCase;
  let departmentRepository: jest.Mocked<DepartmentRepository>;

  const mockDepartments = [
    new Dept({
      id: 1,
      desc1: 'IT Department',
      code: 'IT',
      designation: 'Information Technology',
      isActive: true,
    }),
    new Dept({
      id: 2,
      desc1: 'HR Department',
      code: 'HR',
      designation: 'Human Resources',
      isActive: true,
    }),
    new Dept({
      id: 3,
      desc1: 'Finance Department',
      code: 'FIN',
      designation: 'Finance',
      isActive: false,
    }),
  ];

  const mockPaginatedResult = {
    data: mockDepartments,
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
    const mockDepartmentRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindDepartmentPaginatedListUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
          useValue: mockDepartmentRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindDepartmentPaginatedListUseCase>(
      FindDepartmentPaginatedListUseCase,
    );
    departmentRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated list of departments with default parameters', async () => {
      // Arrange
      departmentRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated list of departments with custom parameters', async () => {
      // Arrange
      const page = 2;
      const limit = 5;
      const search = 'IT';
      departmentRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(search, page, limit);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        search,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty search results', async () => {
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
      departmentRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute('nonexistent', 1, 10);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        'nonexistent',
        1,
        10,
      );
      expect(result).toEqual(emptyResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      departmentRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute('', 1, 10)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null parameters', async () => {
      // Arrange
      departmentRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle undefined parameters', async () => {
      // Arrange
      departmentRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute('', 1, 10);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle mixed parameter types', async () => {
      // Arrange
      const page = 1;
      const limit = 20;
      const search = '';
      departmentRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(search, page, limit);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        search,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const largePageResult = {
        data: [],
        meta: {
          page: 1000,
          limit: 10,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      departmentRepository.findPaginatedList.mockResolvedValue(largePageResult);

      // Act
      const result = await useCase.execute('', 1000, 10);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1000,
        10,
      );
      expect(result).toEqual(largePageResult);
    });

    it('should handle zero limit', async () => {
      // Arrange
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
      departmentRepository.findPaginatedList.mockResolvedValue(zeroLimitResult);

      // Act
      const result = await useCase.execute('', 1, 0);

      // Assert
      expect(departmentRepository.findPaginatedList).toHaveBeenCalledWith(
        '',
        1,
        0,
      );
      expect(result).toEqual(zeroLimitResult);
    });
  });
});
