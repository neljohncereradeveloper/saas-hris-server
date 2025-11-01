import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/jobtitle/retrieve-jobtitle-for-combobox.use-case';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveJobtitleForComboboxUseCase', () => {
  let useCase: RetrieveJobTitleForComboboxUseCase;
  let jobTitleRepository: jest.Mocked<JobTitleRepository>;

  const mockJobTitleRecords = [
    { desc1: 'software engineer' },
    { desc1: 'senior developer' },
    { desc1: 'project manager' },
    { desc1: 'team lead' },
  ];

  beforeEach(async () => {
    const mockJobTitleRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveJobTitleForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
          useValue: mockJobTitleRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveJobTitleForComboboxUseCase>(
      RetrieveJobTitleForComboboxUseCase,
    );
    jobTitleRepository = module.get(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted jobtitle records for combobox', async () => {
      // Arrange
      jobTitleRepository.retrieveForCombobox.mockResolvedValue(
        mockJobTitleRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(jobTitleRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'software engineer', label: 'Software engineer' },
        { value: 'senior developer', label: 'Senior developer' },
        { value: 'project manager', label: 'Project manager' },
        { value: 'team lead', label: 'Team lead' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      jobTitleRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(jobTitleRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      jobTitleRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single character descriptions correctly', async () => {
      // Arrange
      const singleCharRecords = [{ desc1: 'a' }];
      jobTitleRepository.retrieveForCombobox.mockResolvedValue(
        singleCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([{ value: 'a', label: 'A' }]);
    });

    it('should handle mixed case descriptions', async () => {
      // Arrange
      const mixedCaseRecords = [
        { desc1: 'SOFTWARE ENGINEER' },
        { desc1: 'senior developer' },
        { desc1: 'Project Manager' },
      ];
      jobTitleRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'SOFTWARE ENGINEER', label: 'Software engineer' },
        { value: 'senior developer', label: 'Senior developer' },
        { value: 'Project Manager', label: 'Project manager' },
      ]);
    });

    it('should handle descriptions with special characters', async () => {
      // Arrange
      const specialCharRecords = [
        { desc1: 'full-stack developer' },
        { desc1: 'dev-ops engineer' },
        { desc1: 'ui/ux designer' },
      ];
      jobTitleRepository.retrieveForCombobox.mockResolvedValue(
        specialCharRecords,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'full-stack developer', label: 'Full-stack developer' },
        { value: 'dev-ops engineer', label: 'Dev-ops engineer' },
        { value: 'ui/ux designer', label: 'Ui/ux designer' },
      ]);
    });

    it('should handle null or undefined job titles gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: 'valid job title' },
        { desc1: null },
        { desc1: undefined },
        { desc1: '' },
      ];
      jobTitleRepository.retrieveForCombobox.mockResolvedValue(nullData as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'valid job title', label: 'Valid job title' },
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });
  });
});
