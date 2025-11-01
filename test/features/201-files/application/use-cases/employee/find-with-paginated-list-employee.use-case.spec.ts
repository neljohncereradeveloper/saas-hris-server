import { Test, TestingModule } from '@nestjs/testing';
import { FindWithPaginatedListEmployeeUseCase } from '@features/201-files/application/use-cases/employee/find-with-paginated-list-employee.use-case';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('FindEmployeeWithPaginatedListUseCase', () => {
  let useCase: FindWithPaginatedListEmployeeUseCase;
  let employeeRepository: jest.Mocked<EmployeeRepository>;

  const mockEmployee1 = new Employee({
    id: 1,
    fname: 'John',
    lname: 'Doe',
    idNumber: 'EMP001',
    bioNumber: 'BIO001',
    branch: 'Main Branch',
    jobTitle: 'Software Developer',
    employeeStatus: 'Active',
    jobTitleId: 1,
    employeeStatusId: 1,
    branchId: 1,
    hireDate: new Date('2023-01-01'),
    birthDate: new Date('1990-01-01'),
    homeAddressStreet: '123 Main St',
    homeAddressCity: 'New York',
    homeAddressProvince: 'NY',
    homeAddressZipCode: '10001',
    religion: 'Christian',
    civilStatus: 'Single',
    religionId: 1,
    civilStatusId: 1,
    homeAddressCityId: 1,
    homeAddressProvinceId: 1,
  });

  const mockEmployee2 = new Employee({
    id: 2,
    fname: 'Jane',
    lname: 'Smith',
    idNumber: 'EMP002',
    bioNumber: 'BIO002',
    branch: 'Main Branch',
    jobTitle: 'Software Developer',
    employeeStatus: 'Active',
    jobTitleId: 1,
    employeeStatusId: 1,
    branchId: 1,
    hireDate: new Date('2023-01-01'),
    birthDate: new Date('1990-01-01'),
    homeAddressStreet: '456 Oak St',
    homeAddressCity: 'New York',
    homeAddressProvince: 'NY',
    homeAddressZipCode: '10001',
    religion: 'Christian',
    civilStatus: 'Single',
    religionId: 1,
    civilStatusId: 1,
    homeAddressCityId: 1,
    homeAddressProvinceId: 1,
  });

  const mockPaginatedResult = {
    data: [mockEmployee1, mockEmployee2],
    meta: {
      page: 1,
      limit: 10,
      totalRecords: 2,
      totalPages: 1,
      nextPage: null,
      previousPage: null,
    },
  };

  beforeEach(async () => {
    const mockEmployeeRepository = {
      findPaginatedList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindWithPaginatedListEmployeeUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindWithPaginatedListEmployeeUseCase>(
      FindWithPaginatedListEmployeeUseCase,
    );
    employeeRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully return paginated employee list', async () => {
      // Arrange
      const term = 'John';
      const page = 1;
      const limit = 10;
      const employeeStatus = ['Active'];
      employeeRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(mockPaginatedResult);
      expect(result.data).toHaveLength(2);
      expect(result.meta.totalRecords).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should return empty list when no employees found', async () => {
      // Arrange
      const term = 'NonExistent';
      const page = 1;
      const limit = 10;
      const employeeStatus = ['Active'];
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
      employeeRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalRecords).toBe(0);
    });

    it('should handle multiple employee statuses', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      const employeeStatus = ['Active', 'Inactive', 'On Leave'];
      employeeRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle pagination with next page', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 1;
      const employeeStatus = ['Active'];
      const paginatedResultWithNext = {
        data: [mockEmployee1],
        meta: {
          page: 1,
          limit: 1,
          totalRecords: 2,
          totalPages: 2,
          nextPage: 2,
          previousPage: null,
        },
      };
      employeeRepository.findPaginatedList.mockResolvedValue(
        paginatedResultWithNext,
      );

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(paginatedResultWithNext);
      expect(result.meta.nextPage).toBe(2);
      expect(result.meta.previousPage).toBeNull();
    });

    it('should handle pagination with previous page', async () => {
      // Arrange
      const term = '';
      const page = 2;
      const limit = 1;
      const employeeStatus = ['Active'];
      const paginatedResultWithPrevious = {
        data: [mockEmployee2],
        meta: {
          page: 2,
          limit: 1,
          totalRecords: 2,
          totalPages: 2,
          nextPage: null,
          previousPage: 1,
        },
      };
      employeeRepository.findPaginatedList.mockResolvedValue(
        paginatedResultWithPrevious,
      );

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(paginatedResultWithPrevious);
      expect(result.meta.nextPage).toBeNull();
      expect(result.meta.previousPage).toBe(1);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      const employeeStatus = ['Active'];
      const mockError = new Error('Database connection failed');
      employeeRepository.findPaginatedList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        useCase.execute(term, page, limit, employeeStatus),
      ).rejects.toThrow('Database connection failed');

      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
    });

    it('should handle empty search term', async () => {
      // Arrange
      const term = '';
      const page = 1;
      const limit = 10;
      const employeeStatus = ['Active'];
      employeeRepository.findPaginatedList.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle large page numbers', async () => {
      // Arrange
      const term = '';
      const page = 100;
      const limit = 10;
      const employeeStatus = ['Active'];
      const emptyResult = {
        data: [],
        meta: {
          page: 100,
          limit: 10,
          totalRecords: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
        },
      };
      employeeRepository.findPaginatedList.mockResolvedValue(emptyResult);

      // Act
      const result = await useCase.execute(term, page, limit, employeeStatus);

      // Assert
      expect(employeeRepository.findPaginatedList).toHaveBeenCalledWith(
        term,
        page,
        limit,
        employeeStatus,
      );
      expect(result).toEqual(emptyResult);
    });
  });
});
