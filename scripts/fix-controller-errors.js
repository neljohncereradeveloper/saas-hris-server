const fs = require('fs');
const path = require('path');

// List of controllers that need fixing
const controllersToFix = [
  'citizenship/controller/citizenship.controller.ts',
  'city/controller/city.controller.ts',
  'empstatus/controller/empstatus.controller.ts',
  'jobtitle/controller/jobtitle.controller.ts',
  'province/controller/province.controller.ts',
  'reference/controller/reference.controller.ts',
  'religion/controller/religion.controller.ts',
  'training-cert/controller/training-cert.controller.ts',
  'training/controller/training.controller.ts',
  'workexp-company/controller/workexp-company.controller.ts',
  'workexp-jobtitle/controller/workexp-jobtitle.controller.ts',
  'workexp/controller/workexp.controller.ts',
];

// DTO type mappings for fixing invalid references
const dtoMappings = {
  CreateEmpstatusDto: 'CreateEmpStatusDto',
  UpdateEmpstatusDto: 'UpdateEmpStatusDto',
  CreateJobtitleDto: 'CreateJobTitleDto',
  UpdateJobtitleDto: 'UpdateJobTitleDto',
  'CreateTraining-certDto': 'CreateTrainingCertDto',
  'UpdateTraining-certDto': 'UpdateTrainingCertDto',
  'CreateWorkexp-companyDto': 'CreateWorkExpCompanyDto',
  'UpdateWorkexp-companyDto': 'UpdateWorkExpCompanyDto',
  'CreateWorkexp-jobtitleDto': 'CreateWorkExpJobTitleDto',
  'UpdateWorkexp-jobtitleDto': 'UpdateWorkExpJobTitleDto',
  CreateWorkexpDto: 'CreateWorkExpDto',
  UpdateWorkexpDto: 'UpdateWorkExpDto',
};

controllersToFix.forEach((controllerPath) => {
  const fullPath = `src/features/201-files/infrastructure/modules/${controllerPath}`;

  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix @Controller syntax error (missing closing parenthesis)
    content = content.replace(
      /@Controller\(\(([^)]+)\)\s*$/gm,
      '@Controller($1)',
    );

    // Fix invalid DTO type references
    Object.entries(dtoMappings).forEach(([invalid, valid]) => {
      const regex = new RegExp(
        invalid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      );
      content = content.replace(regex, valid);
    });

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${controllerPath}`);
  } else {
    console.log(`Not found: ${controllerPath}`);
  }
});

console.log('All controller syntax errors fixed!');
