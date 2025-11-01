import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EmployeeEntity } from '@features/shared/infrastructure/database/typeorm/postgresql/entities/employee.entity';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Employee } from '@features/shared/domain/models/employee.model';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

@Injectable()
export class EmployeeRepositoryImpl
  implements EmployeeRepository<EntityManager>
{
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repository: Repository<EmployeeEntity>,
  ) {}

  async create(employee: Employee, manager: EntityManager): Promise<Employee> {
    const query = `
      INSERT INTO ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} (
        jobtitleid, empstatusid, branchid, departmentid, hiredate, enddate, regularizationdate,
        idnumber, bionumber, fname, mname, lname, suffix, birthdate, religionid,
        civilstatusid, age, gender, citizenshipid, height, weight,
        homeaddressstreet, homeaddressbarangayid, homeaddresscityid, homeaddressprovinceid, homeaddresszipcode,
        presentaddressstreet, presentaddressbarangayid, presentaddresscityid, presentaddressprovinceid, presentaddresszipcode,
        email, cellphonenumber, telephonenumber,
        emergencycontactname, emergencycontactnumber, emergencycontactrelationship, emergencycontactaddress,
        husbandorwifename, husbandorwifebirthdate, husbandorwifeoccupation, numberofchildren,
        fathersname, fathersbirthdate, fathersoccupation,
        mothersname, mothersbirthdate, mothersoccupation,
        bankaccountnumber, bankaccountname, bankname, bankbranch,
        annualsalary, monthlysalary, dailyrate, hourlyrate,
        createdat, updatedat
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42,
        $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id, jobtitleid, empstatusid, branchid, departmentid, 
        hiredate::text as hiredate, enddate::text as enddate, regularizationdate::text as regularizationdate,
        idnumber, bionumber, imagepath, fname, mname, lname, suffix, birthdate::text as birthdate, religionid,
        civilstatusid, age, gender, citizenshipid, height, weight,
        homeaddressstreet, homeaddressbarangayid, homeaddresscityid, homeaddressprovinceid, homeaddresszipcode,
        presentaddressstreet, presentaddressbarangayid, presentaddresscityid, presentaddressprovinceid, presentaddresszipcode,
        email, cellphonenumber, telephonenumber,
        emergencycontactname, emergencycontactnumber, emergencycontactrelationship, emergencycontactaddress,
        husbandorwifename, husbandorwifebirthdate::text as husbandorwifebirthdate, husbandorwifeoccupation, numberofchildren,
        fathersname, fathersbirthdate::text as fathersbirthdate, fathersoccupation,
        mothersname, mothersbirthdate::text as mothersbirthdate, mothersoccupation,
        bankaccountnumber, bankaccountname, bankname, bankbranch,
        annualsalary, monthlysalary, dailyrate, hourlyrate
    `;

    const result = await manager.query(query, [
      employee.jobTitleId,
      employee.employeeStatusId,
      employee.branchId,
      employee.departmentId,
      employee.hireDate,
      employee.endDate,
      employee.regularizationDate,
      employee.idNumber,
      employee.bioNumber,
      employee.fname,
      employee.mname,
      employee.lname,
      employee.suffix,
      employee.birthDate,
      employee.religionId,
      employee.civilStatusId,
      employee.age,
      employee.gender,
      employee.citizenShipId,
      employee.height,
      employee.weight,
      employee.homeAddressStreet,
      employee.homeAddressBarangayId,
      employee.homeAddressCityId,
      employee.homeAddressProvinceId,
      employee.homeAddressZipCode,
      employee.presentAddressStreet,
      employee.presentAddressBarangayId,
      employee.presentAddressCityId,
      employee.presentAddressProvinceId,
      employee.presentAddressZipCode,
      employee.email,
      employee.cellphoneNumber,
      employee.telephoneNumber,
      employee.emergencyContactName,
      employee.emergencyContactNumber,
      employee.emergencyContactRelationship,
      employee.emergencyContactAddress,
      employee.husbandOrWifeName,
      employee.husbandOrWifeBirthDate,
      employee.husbandOrWifeOccupation,
      employee.numberOfChildren,
      employee.fathersName,
      employee.fathersBirthDate,
      employee.fathersOccupation,
      employee.mothersName,
      employee.mothersBirthDate,
      employee.mothersOccupation,
      employee.bankAccountNumber,
      employee.bankAccountName,
      employee.bankName,
      employee.bankBranch,
      employee.annualSalary,
      employee.monthlySalary,
      employee.dailyRate,
      employee.hourlyRate,
    ]);

    const entity = result[0];
    return this.mapEntityToModel(entity);
  }

  async update(
    id: number,
    dto: Partial<Employee>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    const fieldMappings: Record<string, string> = {
      jobTitleId: 'jobtitleid',
      employeeStatusId: 'empstatusid',
      branchId: 'branchid',
      departmentId: 'departmentid',
      hireDate: 'hiredate',
      endDate: 'enddate',
      regularizationDate: 'regularizationdate',
      idNumber: 'idnumber',
      bioNumber: 'bionumber',
      fName: 'fname',
      mName: 'mname',
      lName: 'lname',
      suffix: 'suffix',
      birthDate: 'birthdate',
      religionId: 'religionid',
      civilStatusId: 'civilstatusid',
      age: 'age',
      gender: 'gender',
      citizenshipId: 'citizenshipid',
      height: 'height',
      weight: 'weight',
      homeAddressStreet: 'homeaddressstreet',
      homeAddressBarangayId: 'homeaddressbarangayid',
      homeAddressCityId: 'homeaddresscityid',
      homeAddressProvinceId: 'homeaddressprovinceid',
      homeAddressZipCode: 'homeaddresszipcode',
      presentAddressStreet: 'presentaddressstreet',
      presentAddressBarangayId: 'presentaddressbarangayid',
      presentAddressCityId: 'presentaddresscityid',
      presentAddressProvinceId: 'presentaddressprovinceid',
      presentAddressZipCode: 'presentaddresszipcode',
      email: 'email',
      cellphoneNumber: 'cellphonenumber',
      telephoneNumber: 'telephonenumber',
      emergencyContactName: 'emergencycontactname',
      emergencyContactNumber: 'emergencycontactnumber',
      emergencyContactRelationship: 'emergencycontactrelationship',
      emergencyContactAddress: 'emergencycontactaddress',
      husbandOrWifeName: 'husbandorwifename',
      husbandOrWifeBirthDate: 'husbandorwifebirthdate',
      husbandOrWifeOccupation: 'husbandorwifeoccupation',
      numberOfChildren: 'numberofchildren',
      fathersName: 'fathersname',
      fathersBirthDate: 'fathersbirthdate',
      fathersOccupation: 'fathersoccupation',
      mothersName: 'mothersname',
      mothersBirthDate: 'mothersbirthdate',
      mothersOccupation: 'mothersoccupation',
      bankAccountNumber: 'bankaccountnumber',
      bankAccountName: 'bankaccountname',
      bankName: 'bankname',
      bankBranch: 'bankbranch',
      annualSalary: 'annualsalary',
      monthlySalary: 'monthlysalary',
      dailyRate: 'dailyrate',
      hourlyRate: 'hourlyrate',
    };

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && fieldMappings[key]) {
        updateFields.push(`${fieldMappings[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) return false;

    updateFields.push(`updatedat = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE emp SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
    const result = await manager.query(query, values);
    return result[1] > 0; // result[1] is the rowCount
  }

  async findById(id: number, manager: EntityManager): Promise<Employee | null> {
    const query = `
      SELECT e.id, e.jobtitleid, e.empstatusid, e.branchid, e.departmentid,
             e.hiredate::text as hiredate, e.enddate::text as enddate, e.regularizationdate::text as regularizationdate,
             e.idnumber, e.bionumber, e.imagepath, e.fname, e.mname, e.lname, e.suffix, 
             e.birthdate::text as birthdate, e.religionid, e.civilstatusid, e.age, e.gender, 
             e.citizenshipid, e.height, e.weight,
             e.homeaddressstreet, e.homeaddressbarangayid, e.homeaddresscityid, e.homeaddressprovinceid, e.homeaddresszipcode,
             e.presentaddressstreet, e.presentaddressbarangayid, e.presentaddresscityid, e.presentaddressprovinceid, e.presentaddresszipcode,
             e.email, e.cellphonenumber, e.telephonenumber,
             e.emergencycontactname, e.emergencycontactnumber, e.emergencycontactrelationship, e.emergencycontactaddress,
             e.husbandorwifename, e.husbandorwifebirthdate::text as husbandorwifebirthdate, e.husbandorwifeoccupation, e.numberofchildren,
             e.fathersname, e.fathersbirthdate::text as fathersbirthdate, e.fathersoccupation,
             e.mothersname, e.mothersbirthdate::text as mothersbirthdate, e.mothersoccupation,
             e.bankaccountnumber, e.bankaccountname, e.bankname, e.bankbranch,
             e.annualsalary, e.monthlysalary, e.dailyrate, e.hourlyrate, e.phic, e.hdmf, e.sssno, e.tinno, e.taxexemptcode,
             jt.desc1 as jobtitle,
             es.desc1 as empstatus,
             b.desc1 as branch,
             d.desc1 as dept,
             r.desc1 as religion,
             cs.desc1 as civilstatus,
             c.desc1 as citizenship,
             ha_city.desc1 as homeaddresscity,
             ha_prov.desc1 as homeaddressprovince,
             ha_bar.desc1 as homeaddressbarangay,
             pa_city.desc1 as presentaddresscity,
             pa_prov.desc1 as presentaddressprovince,
             pa_bar.desc1 as presentaddressbarangay
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} jt ON e.jobtitleid = jt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPSTATUS} es ON e.empstatusid = es.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} b ON e.branchid = b.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} d ON e.departmentid = d.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.RELIGION} r ON e.religionid = r.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CIVILSTATUS} cs ON e.civilstatusid = cs.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITIZENSHIP} c ON e.citizenshipid = c.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} ha_city ON e.homeaddresscityid = ha_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} ha_prov ON e.homeaddressprovinceid = ha_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} ha_bar ON e.homeaddressbarangayid = ha_bar.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} pa_city ON e.presentaddresscityid = pa_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} pa_prov ON e.presentaddressprovinceid = pa_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} pa_bar ON e.presentaddressbarangayid = pa_bar.id
      WHERE e.id = $1
    `;
    const result = await manager.query(query, [id]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  async findByIdNumber(
    idNumber: string,
    manager: EntityManager,
  ): Promise<Employee | null> {
    const query = `
      SELECT e.id, e.jobtitleid, e.empstatusid, e.branchid, e.departmentid,
             e.hiredate::text as hiredate, e.enddate::text as enddate, e.regularizationdate::text as regularizationdate,
             e.idnumber, e.bionumber, e.imagepath, e.fname, e.mname, e.lname, e.suffix, 
             e.birthdate::text as birthdate, e.religionid, e.civilstatusid, e.age, e.gender, 
             e.citizenshipid, e.height, e.weight,
             e.homeaddressstreet, e.homeaddressbarangayid, e.homeaddresscityid, e.homeaddressprovinceid, e.homeaddresszipcode,
             e.presentaddressstreet, e.presentaddressbarangayid, e.presentaddresscityid, e.presentaddressprovinceid, e.presentaddresszipcode,
             e.email, e.cellphonenumber, e.telephonenumber,
             e.emergencycontactname, e.emergencycontactnumber, e.emergencycontactrelationship, e.emergencycontactaddress,
             e.husbandorwifename, e.husbandorwifebirthdate::text as husbandorwifebirthdate, e.husbandorwifeoccupation, e.numberofchildren,
             e.fathersname, e.fathersbirthdate::text as fathersbirthdate, e.fathersoccupation,
             e.mothersname, e.mothersbirthdate::text as mothersbirthdate, e.mothersoccupation,
             e.bankaccountnumber, e.bankaccountname, e.bankname, e.bankbranch,
             e.annualsalary, e.monthlysalary, e.dailyrate, e.hourlyrate, e.phic, e.hdmf, e.sssno, e.tinno, e.taxexemptcode,
             jt.desc1 as jobtitle,
             es.desc1 as empstatus,
             b.desc1 as branch,
             d.desc1 as dept,
             r.desc1 as religion,
             cs.desc1 as civilstatus,
              c.desc1 as citizenship,
              ha_city.desc1 as homeaddresscity,
             ha_prov.desc1 as homeaddressprovince,
             ha_bar.desc1 as homeaddressbarangay,
             pa_city.desc1 as presentaddresscity,
             pa_prov.desc1 as presentaddressprovince,
             pa_bar.desc1 as presentaddressbarangay
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} jt ON e.jobtitleid = jt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPSTATUS} es ON e.empstatusid = es.id
      LEFT JOIN   ${CONSTANTS_DATABASE_MODELS.BRANCH} b ON e.branchid = b.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} d ON e.departmentid = d.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.RELIGION} r ON e.religionid = r.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CIVILSTATUS} cs ON e.civilstatusid = cs.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITIZENSHIP} c ON e.citizenshipid = c.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} ha_city ON e.homeaddresscityid = ha_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} ha_prov ON e.homeaddressprovinceid = ha_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} ha_bar ON e.homeaddressbarangayid = ha_bar.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} pa_city ON e.presentaddresscityid = pa_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} pa_prov ON e.presentaddressprovinceid = pa_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} pa_bar ON e.presentaddressbarangayid = pa_bar.id
      WHERE e.idnumber = $1
    `;
    const result = await manager.query(query, [idNumber]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  async findByBioNumber(
    bionumber: string,
    manager: EntityManager,
  ): Promise<Employee | null> {
    const query = `
      SELECT e.id, e.jobtitleid, e.empstatusid, e.branchid, e.departmentid,
             e.hiredate::text as hiredate, e.enddate::text as enddate, e.regularizationdate::text as regularizationdate,
             e.idnumber, e.bionumber, e.imagepath, e.fname, e.mname, e.lname, e.suffix, 
             e.birthdate::text as birthdate, e.religionid, e.civilstatusid, e.age, e.gender, 
             e.citizenshipid, e.height, e.weight,
             e.homeaddressstreet, e.homeaddressbarangayid, e.homeaddresscityid, e.homeaddressprovinceid, e.homeaddresszipcode,
             e.presentaddressstreet, e.presentaddressbarangayid, e.presentaddresscityid, e.presentaddressprovinceid, e.presentaddresszipcode,
             e.email, e.cellphonenumber, e.telephonenumber,
             e.emergencycontactname, e.emergencycontactnumber, e.emergencycontactrelationship, e.emergencycontactaddress,
             e.husbandorwifename, e.husbandorwifebirthdate::text as husbandorwifebirthdate, e.husbandorwifeoccupation, e.numberofchildren,
             e.fathersname, e.fathersbirthdate::text as fathersbirthdate, e.fathersoccupation,
             e.mothersname, e.mothersbirthdate::text as mothersbirthdate, e.mothersoccupation,
             e.bankaccountnumber, e.bankaccountname, e.bankname, e.bankbranch,
             e.annualsalary, e.monthlysalary, e.dailyrate, e.hourlyrate, e.phic, e.hdmf, e.sssno, e.tinno, e.taxexemptcode,
             jt.desc1 as jobtitle,
             es.desc1 as empstatus,
             b.desc1 as branch,
             d.desc1 as dept,
             r.desc1 as religion,
             cs.desc1 as civilstatus,
             c.desc1 as citizenship,
             ha_city.desc1 as homeaddresscity,
             ha_prov.desc1 as homeaddressprovince,
             ha_bar.desc1 as homeaddressbarangay,
             pa_city.desc1 as presentaddresscity,
             pa_prov.desc1 as presentaddressprovince,
             pa_bar.desc1 as presentaddressbarangay
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} jt ON e.jobtitleid = jt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPSTATUS} es ON e.empstatusid = es.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} b ON e.branchid = b.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} d ON e.departmentid = d.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.RELIGION} r ON e.religionid = r.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CIVILSTATUS} cs ON e.civilstatusid = cs.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITIZENSHIP} c ON e.citizenshipid = c.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} ha_city ON e.homeaddresscityid = ha_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} ha_prov ON e.homeaddressprovinceid = ha_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} ha_bar ON e.homeaddressbarangayid = ha_bar.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} pa_city ON e.presentaddresscityid = pa_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} pa_prov ON e.presentaddressprovinceid = pa_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} pa_bar ON e.presentaddressbarangayid = pa_bar.id
      WHERE e.bionumber = $1
    `;
    const result = await manager.query(query, [bionumber]);

    if (result.length === 0) return null;

    return this.mapEntityToModel(result[0]);
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    employeeStatus: Array<string>,
  ): Promise<{
    data: Employee[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (term) {
      whereClause += `WHERE (e.fname ILIKE $${params.length + 1} OR e.lname ILIKE $${params.length + 1} OR e.idnumber ILIKE $${params.length + 1})`;
      params.push(`%${term}%`);
    }

    if (employeeStatus && employeeStatus.length > 0) {
      const statusPlaceholders = employeeStatus
        .map((_, index) => `$${params.length + index + 1}`)
        .join(',');

      whereClause += ` AND es.desc1 IN (${statusPlaceholders})`;
      params.push(...employeeStatus);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM emp e
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPSTATUS} es ON e.empstatusid = es.id
      ${whereClause}
    `;
    const countResult = await this.repository.query(countQuery, params);
    const totalRecords = parseInt(countResult[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT e.id, e.jobtitleid, e.empstatusid, e.branchid, e.departmentid,
             e.hiredate::text as hiredate, e.enddate::text as enddate, e.regularizationdate::text as regularizationdate,
             e.idnumber, e.bionumber, e.imagepath, e.fname, e.mname, e.lname, e.suffix, 
             e.birthdate::text as birthdate, e.religionid, e.civilstatusid, e.age, e.gender, 
             e.citizenshipid, e.height, e.weight,
             e.homeaddressstreet, e.homeaddressbarangayid, e.homeaddresscityid, e.homeaddressprovinceid, e.homeaddresszipcode,
             e.presentaddressstreet, e.presentaddressbarangayid, e.presentaddresscityid, e.presentaddressprovinceid, e.presentaddresszipcode,
             e.email, e.cellphonenumber, e.telephonenumber,
             e.emergencycontactname, e.emergencycontactnumber, e.emergencycontactrelationship, e.emergencycontactaddress,
             e.husbandorwifename, e.husbandorwifebirthdate::text as husbandorwifebirthdate, e.husbandorwifeoccupation, e.numberofchildren,
             e.fathersname, e.fathersbirthdate::text as fathersbirthdate, e.fathersoccupation,
             e.mothersname, e.mothersbirthdate::text as mothersbirthdate, e.mothersoccupation,
             e.bankaccountnumber, e.bankaccountname, e.bankname, e.bankbranch,
             e.annualsalary, e.monthlysalary, e.dailyrate, e.hourlyrate, e.phic, e.hdmf, e.sssno, e.tinno, e.taxexemptcode,
             jt.desc1 as jobtitle,
             es.desc1 as empstatus,
             b.desc1 as branch,
             d.desc1 as dept,
             r.desc1 as religion,
             cs.desc1 as civilstatus,
             c.desc1 as citizenship,
             ha_city.desc1 as homeaddresscity,
             ha_prov.desc1 as homeaddressprovince,
             ha_bar.desc1 as homeaddressbarangay,
             pa_city.desc1 as presentaddresscity,
             pa_prov.desc1 as presentaddressprovince,
             pa_bar.desc1 as presentaddressbarangay
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} e
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.JOBTITLE} jt ON e.jobtitleid = jt.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.EMPSTATUS} es ON e.empstatusid = es.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BRANCH} b ON e.branchid = b.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.DEPARTMENT} d ON e.departmentid = d.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.RELIGION} r ON e.religionid = r.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CIVILSTATUS} cs ON e.civilstatusid = cs.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITIZENSHIP} c ON e.citizenshipid = c.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} ha_city ON e.homeaddresscityid = ha_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} ha_prov ON e.homeaddressprovinceid = ha_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} ha_bar ON e.homeaddressbarangayid = ha_bar.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.CITY} pa_city ON e.presentaddresscityid = pa_city.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.PROVINCE} pa_prov ON e.presentaddressprovinceid = pa_prov.id
      LEFT JOIN ${CONSTANTS_DATABASE_MODELS.BARANGAY} pa_bar ON e.presentaddressbarangayid = pa_bar.id
      ${whereClause}
      ORDER BY e.fname ASC, e.lname ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const entities = await this.repository.query(dataQuery, params);

    const data = entities.map((entity: any) => this.mapEntityToModel(entity));

    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  async updateEmployeeImagePath(
    employeeId: number,
    imagepath: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} 
      SET imagepath = $1, updatedat = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await manager.query(query, [imagepath, employeeId]);
    return result[1] > 0; // result[1] is the rowCount
  }

  async updateEmployeeGovernmentDetails(
    employeeId: number,
    governmentDetails: Partial<Employee>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings: Record<string, string> = {
      phic: 'phic',
      hdmf: 'hdmf',
      sssNo: 'sssno',
      tinNo: 'tinno',
      taxExemptCode: 'taxexemptcode',
    };

    for (const [key, value] of Object.entries(governmentDetails)) {
      if (value !== undefined && fieldMappings[key]) {
        updateFields.push(`${fieldMappings[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) return false;

    updateFields.push(`updatedat = CURRENT_TIMESTAMP`);
    values.push(employeeId);

    const query = `UPDATE ${CONSTANTS_DATABASE_MODELS.EMPLOYEE} SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
    const result = await manager.query(query, values);
    return result[1] > 0; // result[1] is the rowCount
  }

  async retrieveActiveEmployees(manager: EntityManager): Promise<Employee[]> {
    const query = `
      SELECT id, jobtitleid, empstatusid, branchid, departmentid,
             hiredate::text as hiredate, enddate::text as enddate, regularizationdate::text as regularizationdate,
             idnumber, bionumber, imagepath, fname, mname, lname, suffix, 
             birthdate::text as birthdate, religionid, civilstatusid, age, gender, 
             citizenshipid, height, weight,
             homeaddressstreet, homeaddressbarangayid, homeaddresscityid, homeaddressprovinceid, homeaddresszipcode,
             presentaddressstreet, presentaddressbarangayid, presentaddresscityid, presentaddressprovinceid, presentaddresszipcode,
             email, cellphonenumber, telephonenumber,
             emergencycontactname, emergencycontactnumber, emergencycontactrelationship, emergencycontactaddress,
             husbandorwifename, husbandorwifebirthdate::text as husbandorwifebirthdate, husbandorwifeoccupation, numberofchildren,
             fathersname, fathersbirthdate::text as fathersbirthdate, fathersoccupation,
             mothersname, mothersbirthdate::text as mothersbirthdate, mothersoccupation,
             bankaccountnumber, bankaccountname, bankname, bankbranch,
             annualsalary, monthlysalary, dailyrate, hourlyrate, phic, hdmf, sssno, tinno, taxexemptcode
      FROM ${CONSTANTS_DATABASE_MODELS.EMPLOYEE}
    `;
    const result = await manager.query(query);

    return result.map((entity: any) => this.mapEntityToModel(entity));
  }

  private mapEntityToModel(entity: any): Employee {
    return new Employee({
      id: entity.id,
      jobTitleId: entity.jobtitleid,
      jobTitle: entity.jobtitle,
      employeeStatusId: entity.empstatusid,
      employeeStatus: entity.empstatus,
      branchId: entity.branchid,
      branch: entity.branch,
      departmentId: entity.departmentid,
      department: entity.dept,
      hireDate: entity.hiredate,
      endDate: entity.endDate,
      regularizationDate: entity.regularizationdate,
      idNumber: entity.idnumber,
      bioNumber: entity.bionumber,
      imagePath: entity.imagepath,
      fname: entity.fname,
      mname: entity.mname,
      lname: entity.lname,
      suffix: entity.suffix,
      birthDate: entity.birthdate,
      religionId: entity.religionid,
      religion: entity.religion,
      civilStatusId: entity.civilstatusid,
      civilStatus: entity.civilstatus,
      age: entity.age,
      gender: entity.gender,
      citizenShipId: entity.citizenshipid,
      citizenShip: entity.citizenship,
      height: entity.height,
      weight: entity.weight,
      homeAddressStreet: entity.homeaddressstreet,
      homeAddressBarangayId: entity.homeaddressbarangayid,
      homeAddressBarangay: entity.homeaddressbarangay,
      homeAddressCityId: entity.homeaddresscityid,
      homeAddressCity: entity.homeaddresscity,
      homeAddressProvinceId: entity.homeaddressprovinceid,
      homeAddressProvince: entity.homeaddressprovince,
      homeAddressZipCode: entity.homeaddresszipcode,
      presentAddressStreet: entity.presentaddressstreet,
      presentAddressBarangayId: entity.presentaddressbarangayid,
      presentAddressBarangay: entity.presentaddressbarangay,
      presentAddressCityId: entity.presentaddresscityid,
      presentAddressCity: entity.presentaddresscity,
      presentAddressProvinceId: entity.presentaddressprovinceid,
      presentAddressZipCode: entity.presentaddresszipcode,
      email: entity.email,
      cellphoneNumber: entity.cellphonenumber,
      telephoneNumber: entity.telephonenumber,
      emergencyContactName: entity.emergencycontactname,
      emergencyContactNumber: entity.emergencycontactnumber,
      emergencyContactRelationship: entity.emergencycontactrelationship,
      emergencyContactAddress: entity.emergencycontactaddress,
      husbandOrWifeName: entity.husbandorwifename,
      husbandOrWifeBirthDate: entity.husbandorwifebirthdate,
      husbandOrWifeOccupation: entity.husbandorwifeoccupation,
      numberOfChildren: entity.numberofchildren,
      fathersName: entity.fathersname,
      fathersBirthDate: entity.fathersbirthdate,
      fathersOccupation: entity.fathersoccupation,
      mothersName: entity.mothersname,
      mothersBirthDate: entity.mothersbirthdate,
      mothersOccupation: entity.mothersoccupation,
      bankAccountNumber: entity.bankaccountnumber,
      bankAccountName: entity.bankaccountname,
      bankName: entity.bankname,
      bankBranch: entity.bankbranch,
      annualSalary: entity.annualsalary,
      monthlySalary: entity.monthlysalary,
      dailyRate: entity.dailyrate,
      hourlyRate: entity.hourlyrate,
      phic: entity.phic,
      hdmf: entity.hdmf,
      sssNo: entity.sssno,
      tinNo: entity.tinno,
      taxExemptCode: entity.taxexemptcode,
    });
  }
}
