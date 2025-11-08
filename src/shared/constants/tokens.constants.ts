export const CONSTANTS_REPOSITORY_TOKENS = {
  /** Transaction Port Interface*/
  TRANSACTIONPORT: 'TransactionPort',
  /** activitylogs */
  ACTIVITYLOGS: 'activitylog',
  /** Error Handler Port Interface */
  ERROR_HANDLER: 'ErrorHandlerPort',
  /** JWT PORT */
  JWT_PORT: 'JwtTokenAdapter',

  //#region 201-files database models

  /** employee */
  EMPLOYEE: 'emp',
  /** barangay */
  BARANGAY: 'barangay',
  /** city */
  CITY: 'city',
  /** province */
  PROVINCE: 'province',
  /** branch */
  BRANCH: 'branch',
  /** dept */
  DEPARTMENT: 'dept',
  /** empstatus */
  EMPSTATUS: 'empstatus',
  /** jobtitle */
  JOBTITLE: 'jobtitle',
  /** religion */
  RELIGION: 'religion',
  /** civilstatus */
  CIVILSTATUS: 'civilstatus',
  /** citizenship */
  CITIZENSHIP: 'citizenship',

  /**
   * education
   */
  /** edu */
  EDU: 'edu',
  /** edu_course */
  EDUCOURSE: 'edu_course',
  /** edu_courselevel */
  EDUCOURSELEVEL: 'edu_courselevel',
  /** edu_level */
  EDULEVEL: 'edu_level',
  /** edu_school */
  EDUSCHOOL: 'edu_school',

  /**
   * trainings
   */
  /** trainings */
  TRAINING: 'training',
  /** trainings_cert */
  TRAININGCERT: 'training_cert',

  /**
   * work experiences
   */
  /** workexp */
  WORKEXP: 'workexp',
  /** workexp_company */
  WORKEXPCOMPANY: 'workexp_company',
  /** workexp_jobtitle */
  WORKEXPJOBTITLE: 'workexp_jobtitle',

  /**
   * reference
   */
  /** reference */
  REFERENCE: 'reference',

  //#endregion 201-files

  /** employee_movement */
  EMPLOYEE_MOVEMENT: 'emp_movement',
  /** employee_movement_type */
  EMPLOYEE_MOVEMENT_TYPE: 'emp_movement_type',

  //#region leave-management

  /** leave */
  LEAVE: 'leave',
  /** leave_type */
  LEAVE_TYPE: 'leave_type',
  /** leave_policy */
  LEAVE_POLICY: 'leave_policy',
  /** leave_balance */
  LEAVE_BALANCE: 'leave_balance',
  /** leave_cycle */
  LEAVE_CYCLE: 'leave_cycle',
  /** leave_request */
  LEAVE_REQUEST: 'leave_request',
  /** leave_transaction */
  LEAVE_TRANSACTION: 'leave_transaction',
  /** leave_year_configuration */
  LEAVE_YEAR_CONFIGURATION: 'leave_year_configuration',
  /** holiday */
  HOLIDAY: 'holiday',

  //#endregion leave-management

  //#region document-management

  /** document_type */
  DOCUMENT_TYPE: 'document_type',
  /** document */
  DOCUMENT: 'document',

  //#endregion document-management

  //#region upload

  /** upload_port */
  UPLOAD_PORT: 'UploadPort',

  //#endregion upload
};
