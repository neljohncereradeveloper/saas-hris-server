import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveWorkExpJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/retrieve-workexp-jobtitle-for-combobox.use-case';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveWorkexpjobtitleForComboboxUseCase', () => {
  let useCase: RetrieveWorkExpJobTitleForComboboxUseCase;
  let workexpjobtitleRepository: jest.Mocked<WorkExpJobTitleRepository>;

  const mockWorkexpjobtitleData = [
    { desc1: 'software engineer' },
    { desc1: 'senior developer' },
    { desc1: 'project manager' },
    { desc1: 'data scientist' },
    { desc1: 'devops engineer' },
  ];

  beforeEach(async () => {
    const mockWorkexpjobtitleRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveWorkExpJobTitleForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
          useValue: mockWorkexpjobtitleRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveWorkExpJobTitleForComboboxUseCase>(
      RetrieveWorkExpJobTitleForComboboxUseCase,
    );
    workexpjobtitleRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted work experience job title options for combobox', async () => {
      // Arrange
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        mockWorkexpjobtitleData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(workexpjobtitleRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'software engineer', label: 'Software engineer' },
        { value: 'senior developer', label: 'Senior developer' },
        { value: 'project manager', label: 'Project manager' },
        { value: 'data scientist', label: 'Data scientist' },
        { value: 'devops engineer', label: 'Devops engineer' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(workexpjobtitleRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      workexpjobtitleRepository.retrieveForCombobox.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single word job titles correctly', async () => {
      // Arrange
      const singleWordData = [{ desc1: 'developer' }];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        singleWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([{ value: 'developer', label: 'Developer' }]);
    });

    it('should format multi-word job titles correctly', async () => {
      // Arrange
      const multiWordData = [
        { desc1: 'full stack developer' },
        { desc1: 'machine learning engineer' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        multiWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'full stack developer', label: 'Full stack developer' },
        {
          value: 'machine learning engineer',
          label: 'Machine learning engineer',
        },
      ]);
    });

    it('should handle job titles with special characters', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'c++ developer' },
        { desc1: 'c# .net developer' },
        { desc1: 'sql server administrator' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'c++ developer', label: 'C++ developer' },
        { value: 'c# .net developer', label: 'C# .net developer' },
        {
          value: 'sql server administrator',
          label: 'Sql server administrator',
        },
      ]);
    });

    it('should handle job titles with numbers', async () => {
      // Arrange
      const numberData = [
        { desc1: 'level 2 developer' },
        { desc1: 'senior developer 3' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        numberData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'level 2 developer', label: 'Level 2 developer' },
        { value: 'senior developer 3', label: 'Senior developer 3' },
      ]);
    });

    it('should handle job titles with mixed case', async () => {
      // Arrange
      const mixedCaseData = [
        { desc1: 'SOFTWARE ENGINEER' },
        { desc1: 'Senior Developer' },
        { desc1: 'project MANAGER' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'SOFTWARE ENGINEER', label: 'Software engineer' },
        { value: 'Senior Developer', label: 'Senior developer' },
        { value: 'project MANAGER', label: 'Project manager' },
      ]);
    });

    it('should handle very long job titles', async () => {
      // Arrange
      const longJobTitle = 'A'.repeat(1000);
      const longData = [{ desc1: longJobTitle }];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        {
          value: longJobTitle,
          label:
            longJobTitle.charAt(0).toUpperCase() +
            longJobTitle.slice(1).toLowerCase(),
        },
      ]);
    });

    it('should handle job titles with leading/trailing spaces', async () => {
      // Arrange
      const spacedData = [
        { desc1: '  software engineer  ' },
        { desc1: ' senior developer ' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        spacedData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: '  software engineer  ', label: '  software engineer  ' },
        { value: ' senior developer ', label: ' senior developer ' },
      ]);
    });

    it('should handle empty job titles gracefully', async () => {
      // Arrange
      const emptyData = [{ desc1: '' }, { desc1: '' }, { desc1: '' }];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        emptyData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ]);
    });

    it('should handle job titles with hyphens and underscores', async () => {
      // Arrange
      const hyphenData = [
        { desc1: 'full-stack-developer' },
        { desc1: 'front_end_developer' },
        { desc1: 'back-end-engineer' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        hyphenData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'full-stack-developer', label: 'Full-stack-developer' },
        { value: 'front_end_developer', label: 'Front_end_developer' },
        { value: 'back-end-engineer', label: 'Back-end-engineer' },
      ]);
    });

    it('should handle job titles with periods and commas', async () => {
      // Arrange
      const punctuationData = [
        { desc1: 'dr. software engineer' },
        { desc1: 'senior developer, team lead' },
        { desc1: 'project manager & coordinator' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        punctuationData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'dr. software engineer', label: 'Dr. software engineer' },
        {
          value: 'senior developer, team lead',
          label: 'Senior developer, team lead',
        },
        {
          value: 'project manager & coordinator',
          label: 'Project manager & coordinator',
        },
      ]);
    });

    it('should handle job titles with roman numerals', async () => {
      // Arrange
      const romanNumeralData = [
        { desc1: 'software engineer ii' },
        { desc1: 'senior developer iii' },
        { desc1: 'project manager iv' },
      ];
      workexpjobtitleRepository.retrieveForCombobox.mockResolvedValue(
        romanNumeralData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'software engineer ii', label: 'Software engineer ii' },
        { value: 'senior developer iii', label: 'Senior developer iii' },
        { value: 'project manager iv', label: 'Project manager iv' },
      ]);
    });
  });
});
