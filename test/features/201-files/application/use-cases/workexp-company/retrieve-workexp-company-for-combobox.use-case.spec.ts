import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveWorkExpCompanyForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-company/retrieve-workexp-company-for-combobox.use-case';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

describe('RetrieveWorkexpcompanyForComboboxUseCase', () => {
  let useCase: RetrieveWorkExpCompanyForComboboxUseCase;
  let workexpcompanyRepository: jest.Mocked<WorkexpCompanyRepository>;

  const mockWorkexpcompanyData = [
    { desc1: 'tech corp' },
    { desc1: 'startup inc' },
    { desc1: 'global solutions' },
    { desc1: 'innovation labs' },
    { desc1: 'digital systems' },
  ];

  beforeEach(async () => {
    const mockWorkexpcompanyRepository = {
      retrieveForCombobox: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveWorkExpCompanyForComboboxUseCase,
        {
          provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
          useValue: mockWorkexpcompanyRepository,
        },
      ],
    }).compile();

    useCase = module.get<RetrieveWorkExpCompanyForComboboxUseCase>(
      RetrieveWorkExpCompanyForComboboxUseCase,
    );
    workexpcompanyRepository = module.get(
      CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return formatted work experience company options for combobox', async () => {
      // Arrange
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        mockWorkexpcompanyData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(workexpcompanyRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([
        { value: 'tech corp', label: 'Tech corp' },
        { value: 'startup inc', label: 'Startup inc' },
        { value: 'global solutions', label: 'Global solutions' },
        { value: 'innovation labs', label: 'Innovation labs' },
        { value: 'digital systems', label: 'Digital systems' },
      ]);
    });

    it('should handle empty results', async () => {
      // Arrange
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(workexpcompanyRepository.retrieveForCombobox).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      workexpcompanyRepository.retrieveForCombobox.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should format single word company names correctly', async () => {
      // Arrange
      const singleWordData = [{ desc1: 'microsoft' }];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        singleWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([{ value: 'microsoft', label: 'Microsoft' }]);
    });

    it('should format multi-word company names correctly', async () => {
      // Arrange
      const multiWordData = [{ desc1: 'google llc' }, { desc1: 'apple inc' }];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        multiWordData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'google llc', label: 'Google llc' },
        { value: 'apple inc', label: 'Apple inc' },
      ]);
    });

    it('should handle company names with special characters', async () => {
      // Arrange
      const specialCharData = [
        { desc1: 'at&t communications' },
        { desc1: '3m company' },
        { desc1: 'c++ software inc' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        specialCharData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'at&t communications', label: 'At&t communications' },
        { value: '3m company', label: '3m company' },
        { value: 'c++ software inc', label: 'C++ software inc' },
      ]);
    });

    it('should handle company names with numbers', async () => {
      // Arrange
      const numberData = [
        { desc1: 'company 2023' },
        { desc1: 'tech solutions 2.0' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        numberData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'company 2023', label: 'Company 2023' },
        { value: 'tech solutions 2.0', label: 'Tech solutions 2.0' },
      ]);
    });

    it('should handle company names with mixed case', async () => {
      // Arrange
      const mixedCaseData = [
        { desc1: 'MICROSOFT CORPORATION' },
        { desc1: 'Google LLC' },
        { desc1: 'amazon web SERVICES' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        mixedCaseData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'MICROSOFT CORPORATION', label: 'Microsoft corporation' },
        { value: 'Google LLC', label: 'Google llc' },
        { value: 'amazon web SERVICES', label: 'Amazon web services' },
      ]);
    });

    it('should handle very long company names', async () => {
      // Arrange
      const longCompanyName = 'A'.repeat(1000);
      const longData = [{ desc1: longCompanyName }];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(longData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        {
          value: longCompanyName,
          label:
            longCompanyName.charAt(0).toUpperCase() +
            longCompanyName.slice(1).toLowerCase(),
        },
      ]);
    });

    it('should handle company names with leading/trailing spaces', async () => {
      // Arrange
      const spacedData = [
        { desc1: '  tech corp  ' },
        { desc1: ' startup inc ' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        spacedData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: '  tech corp  ', label: '  tech corp  ' },
        { value: ' startup inc ', label: ' startup inc ' },
      ]);
    });

    it('should handle null or undefined company names gracefully', async () => {
      // Arrange
      const nullData = [
        { desc1: null as any },
        { desc1: undefined as any },
        { desc1: '' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(nullData);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: null, label: '' },
        { value: undefined, label: '' },
        { value: '', label: '' },
      ]);
    });

    it('should handle company names with hyphens and underscores', async () => {
      // Arrange
      const hyphenData = [
        { desc1: 'tech-solutions-corp' },
        { desc1: 'startup_inc' },
        { desc1: 'global-solutions-llc' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        hyphenData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'tech-solutions-corp', label: 'Tech-solutions-corp' },
        { value: 'startup_inc', label: 'Startup_inc' },
        { value: 'global-solutions-llc', label: 'Global-solutions-llc' },
      ]);
    });

    it('should handle company names with periods and commas', async () => {
      // Arrange
      const punctuationData = [
        { desc1: 'dr. smith & associates' },
        { desc1: 'johnson, inc.' },
        { desc1: 'smith & co.' },
      ];
      workexpcompanyRepository.retrieveForCombobox.mockResolvedValue(
        punctuationData,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([
        { value: 'dr. smith & associates', label: 'Dr. smith & associates' },
        { value: 'johnson, inc.', label: 'Johnson, inc.' },
        { value: 'smith & co.', label: 'Smith & co.' },
      ]);
    });
  });
});
