# Leave Management Domain Documentation

## Table of Contents

1. [Business Domain Overview](#business-domain-overview)
2. [Domain Entities](#domain-entities)
3. [Business Processes](#business-processes)
4. [Business Rules](#business-rules)
5. [Entity Relationships](#entity-relationships)
6. [Status Lifecycles](#status-lifecycles)
7. [Common Use Cases](#common-use-cases)

---

## Business Domain Overview

The Leave Management domain is a comprehensive system for managing employee leave entitlements, balances, requests, and encashment. The domain follows a cycle-based approach where leave policies define entitlements, balances track annual credits, and employees can request leave or encash unused credits within defined limits.

**Leave Year System:** The system uses flexible cutoff periods (defined by LeaveYearConfiguration) to determine leave year boundaries. Instead of calendar years, leave years can be defined by custom date ranges (e.g., Nov 26 to Nov 25). This allows organizations to align leave years with their business cycles. Leave balances use leave year identifiers (e.g., "2023-2024") instead of numeric calendar years, enabling accurate tracking across different cutoff periods.

### Core Concepts

- **Leave Types**: Categories of leave (Vacation, Sick, Personal, etc.)
- **Leave Policies**: Rules governing leave entitlements, carry-over, and encashment limits
- **Leave Year Configuration**: Defines cutoff periods that determine leave year boundaries (e.g., Nov 26 to Nov 25)
- **Leave Cycles**: Multi-year periods for tracking leave usage and carry-over
- **Leave Balances**: Annual tracking of earned, used, carried over, and remaining leave days (tied to leave year identifiers)
- **Leave Requests**: Employee applications for time off
- **Leave Transactions**: Historical record of all balance changes
- **Leave Encashment**: Converting unused leave days to cash compensation

---

## Domain Entities

### 1. LeaveType

Represents a category of leave available to employees.

**Fields:**

- `id` (number): Unique identifier
- `name` (string): Full name of the leave type (e.g., "Annual Vacation")
- `code` (string): Short code identifier (e.g., "VL", "SL")
- `desc1` (string): Description of the leave type
- `paid` (boolean): Whether this leave type is paid or unpaid
- `isActive` (boolean): Whether the leave type is currently active

**Business Purpose:** Defines the fundamental types of leave available in the system.

**Repository Operations:**

- `create(type, context)` - Create a new leave type
- `update(id, dto, context)` - Update leave type details
- `findById(id, context)` - Retrieve by ID
- `findPaginatedList(term, page, limit)` - Search and paginate
- `findByName(name, context)` - Find by exact name
- `findByCode(code, context)` - Find by exact code
- `retrieveForCombobox()` - Get all active types for UI
- `softDelete(id, isActive, context)` - Deactivate a leave type

---

### 2. LeavePolicy

Represents rules governing leave entitlements for specific leave types.

**Fields:**

- `id` (number): Unique identifier
- `leaveTypeId` (number): Reference to the leave type
- `leaveType` (string): Name of the leave type (denormalized)
- `annualEntitlement` (number): Days granted per year
- `carryLimit` (number): Maximum days that can be carried over to next year
- `encashLimit` (number): Maximum days that can be encashed
- `cycleLengthYears` (number): Policy cycle duration in years
- `effectiveDate` (Date): Date when policy becomes active
- `expiryDate` (Date): Date when policy expires
- `status` (EnumLeavePolicyStatus): Current policy status
- `isActive` (boolean): Whether the policy is active

**Status Values:**

- `DRAFT` - Policy is being prepared
- `ACTIVE` - Policy is currently in effect
- `INACTIVE` - Policy is suspended but not retired
- `RETIRED` - Policy is no longer used

**Business Purpose:** Defines the annual entitlements, carry-over limits, and encashment limits for each leave type.

**Repository Operations:**

- `create(policy, context)` - Create a new policy
- `update(id, dto, context)` - Update policy details
- `findById(id, context)` - Retrieve by ID
- `findPaginatedList(term, page, limit)` - Search and paginate
- `retrieveActivePolicies(context)` - Get all active policies
- `getActivePolicy(leaveTypeId, date)` - Get policy active on specific date
- `activatePolicy(id, context)` - Set policy status to ACTIVE
- `retirePolicy(id, context)` - Retire a policy
- `softDelete(id, isActive, context)` - Deactivate a policy

---

### 3. LeaveBalance

Tracks an employee's leave credits for a specific year and leave type.

**Fields:**

- `id` (number): Unique identifier
- `employeeId` (number): Reference to employee
- `leaveTypeId` (number): Reference to leave type
- `leaveType` (string): Name of leave type (denormalized)
- `policyId` (number): Reference to the active policy for this balance
- `year` (string): Leave year identifier this balance covers (e.g., "2023-2024" for Nov 26, 2023 to Nov 25, 2024)
- `beginningBalance` (number): Starting balance at year beginning
- `earned` (number): Days credited during the year
- `used` (number): Days consumed (from approved requests)
- `carriedOver` (number): Days carried from previous year (within carry limit)
- `encashed` (number): Days converted to cash
- `remaining` (number): Current available days (calculated as: (earned + carriedOver) - (used + encashed))
- `lastTransactionDate` (Date): Last date balance was modified
- `status` (EnumLeaveBalanceStatus): Current balance status
- `remarks` (string): Additional notes about the balance
- `isActive` (boolean): Whether the balance is active

**Balance Formula:**

```
remaining = (beginningBalance + earned + carriedOver) - (used + encashed)
```

**Status Values:**

- `OPEN` - Balance is currently open and active
- `CLOSED` - Balance has been closed (year-end)
- `REOPENED` - A closed balance was reopened for corrections
- `FINALIZED` - Balance is finalized and cannot be modified

**Business Purpose:** Tracks annual leave entitlements, usage, and remaining credits per employee per leave type.

**Repository Operations:**

- `create(balance, context)` - Create a new balance
- `update(id, dto, context)` - Update balance details
- `findById(id, context)` - Retrieve by ID
- `findByEmployeeYear(employeeId, year)` - Get all balances for an employee in a leave year (year is string identifier)
- `findByLeaveType(employeeId, leaveTypeId, year, context)` - Find specific balance (year is string identifier)
- `closeBalance(id, context)` - Close a balance at year-end
- `resetBalancesForYear(year, context)` - Initialize balances for all employees (year is string identifier)
- `softDelete(id, isActive, context)` - Deactivate a balance

---

### 4. LeaveRequest

Represents an employee's application for leave.

**Fields:**

- `id` (number): Unique identifier
- `employeeId` (number): Employee requesting leave
- `leaveTypeId` (number): Type of leave requested
- `leaveType` (string): Name of leave type (denormalized)
- `startDate` (Date): First day of leave
- `endDate` (Date): Last day of leave
- `totalDays` (number): Number of days requested
- `reason` (string): Reason for leave request
- `balanceId` (number): Reference to the balance being used
- `approvalDate` (Date): Date when request was approved/rejected
- `approvalBy` (number): ID of person who approved/rejected
- `remarks` (string): Approval/rejection remarks
- `status` (EnumLeaveRequestStatus): Current request status
- `isActive` (boolean): Whether the request is active

**Status Values:**

- `PENDING` - Awaiting approval
- `APPROVED` - Leave has been approved
- `REJECTED` - Leave has been rejected
- `CANCELLED` - Request was cancelled by employee

**Business Purpose:** Manages employee leave applications and tracks approval workflow.

**Repository Operations:**

- `create(request, context)` - Submit a new leave request
- `update(id, dto, context)` - Update request details
- `findById(id, context)` - Retrieve by ID
- `findByEmployee(employeeId, context)` - Get all requests for an employee
- `findPending(context)` - Get all pending requests awaiting approval
- `findPaginatedList(term, page, limit)` - Search and paginate requests
- `updateStatus(id, status, approverId, remarks, context)` - Approve/reject request
- `softDelete(id, isActive, context)` - Cancel a request

---

### 5. LeaveTransaction

Maintains an audit trail of all changes to a leave balance.

**Fields:**

- `id` (number): Unique identifier
- `balanceId` (number): Reference to the balance being modified
- `transactionType` (EnumLeaveTransactionType): Type of transaction
- `days` (number): Number of days affected (positive or negative)
- `remarks` (string): Transaction description
- `isActive` (boolean): Whether the transaction is active

**Transaction Types:**

- `REQUEST` - Leave request approved, days deducted
- `ENCASHMENT` - Leave encashed, days deducted
- `ADJUSTMENT` - Manual balance adjustment
- `CARRY` - Days carried over from previous year

**Business Purpose:** Provides a complete audit log of all balance changes for traceability and reporting.

**Repository Operations:**

- `create(tx, context)` - Record a new transaction
- `findByBalance(balanceId, context)` - Get all transactions for a balance
- `recordTransaction(balanceId, type, days, remarks, userId, context)` - Create transaction and update balance

---

### 6. LeaveCycle

Tracks multi-year cycles for leave accumulation and carry-over rules.

**Fields:**

- `id` (number): Unique identifier
- `employeeId` (number): Employee for this cycle
- `leaveTypeId` (number): Leave type for this cycle
- `leaveType` (string): Name of leave type (denormalized)
- `cycleStartYear` (number): First year of the cycle
- `cycleEndYear` (number): Last year of the cycle
- `totalCarried` (number): Total days carried within this cycle
- `status` (EnumLeaveCycleStatus): Current cycle status
- `isActive` (boolean): Whether the cycle is active

**Status Values:**

- `ACTIVE` - Cycle is currently in progress
- `COMPLETED` - Cycle has ended

**Business Purpose:** Manages multi-year leave cycles to track carry-over limits and cycle-based entitlements.

**Repository Operations:**

- `create(cycle, context)` - Start a new cycle
- `update(id, dto, context)` - Update cycle details
- `findByEmployee(employeeId, context)` - Get all cycles for an employee
- `getActiveCycle(employeeId, leaveTypeId, context)` - Get current active cycle
- `closeCycle(id, context)` - Complete a cycle

---

### 7. LeaveEncashment

Tracks requests to convert unused leave to cash compensation.

**Fields:**

- `id` (number): Unique identifier
- `employeeId` (number): Employee requesting encashment
- `balanceId` (number): Reference to the balance being encashed
- `totalDays` (number): Number of days being encashed
- `amount` (number): Monetary value of the encashment
- `status` (EnumLeaveEncashmentStatus): Current encashment status
- `isActive` (boolean): Whether the encashment is active

**Status Values:**

- `PENDING` - Encashment requested, awaiting processing
- `PAID` - Encashment has been paid out
- `CANCELLED` - Encashment was cancelled

**Business Purpose:** Manages the conversion of unused leave days to cash compensation within policy limits.

**Repository Operations:**

- `create(encash, context)` - Create an encashment request
- `update(id, dto, context)` - Update encashment details
- `findById(id, context)` - Retrieve by ID
- `findPending(context)` - Get all pending encashments
- `markAsPaid(id, payrollRef, context)` - Mark encashment as paid
- `findByEmployee(employeeId, context)` - Get encashments for an employee

---

### 8. LeaveYearConfiguration

Defines the cutoff period that determines leave year boundaries. This allows flexible leave year definitions that don't align with calendar years (e.g., Nov 26 to Nov 25).

**Fields:**

- `id` (number): Unique identifier
- `cutoffStartDate` (Date): Start date of the cutoff period (e.g., Nov 26)
- `cutoffEndDate` (Date): End date of the cutoff period (e.g., Nov 25 of next year)
- `year` (string): Leave year identifier (e.g., "2023-2024") - generated from cutoff dates
- `remarks` (string): Optional notes about the configuration
- `isActive` (boolean): Whether the configuration is active

**Business Purpose:** Defines flexible leave year boundaries that can change from year to year. The cutoff period determines which leave year a date falls into, enabling custom leave year definitions (e.g., Nov 26 to Nov 25) instead of calendar years.

**Key Features:**

- **Flexible Cutoff Dates**: Each configuration can have different start and end dates
- **Leave Year Identifier**: Automatically generated in format "YYYY-YYYY" (e.g., "2023-2024")
- **Date-Based Lookup**: System finds active configuration for any given date
- **Historical Tracking**: Old configurations preserved when new ones are created

**Repository Operations:**

- `create(configuration, context)` - Create a new cutoff configuration
- `update(id, dto, context)` - Update cutoff dates or details
- `findById(id, context)` - Retrieve by ID
- `findByYear(year, context)` - Find configuration by leave year identifier
- `findActiveForDate(date, context)` - Get active configuration for a specific date
- `findAll(context)` - Get all active configurations
- `softDelete(id, isActive, context)` - Deactivate a configuration

**Example Usage:**

```
Configuration 1:
- cutoffStartDate: Nov 26, 2023
- cutoffEndDate: Nov 25, 2024
- year: "2023-2024"

Configuration 2:
- cutoffStartDate: Nov 26, 2024
- cutoffEndDate: Nov 5, 2025  (different end date)
- year: "2024-2025"
```

**Important Rules:**

- Only one active configuration can cover a specific date
- Cutoff end date must be after cutoff start date
- Leave year identifier is automatically generated from dates
- When cutoff dates change, create a new configuration (old balances remain tied to old cutoff)

---

### 9. Holiday (Shared Domain)

**Note:** Holiday management is located in the **shared domain** (`@features/shared`) because holidays are used by multiple domains including leave management and payroll.

Represents a public holiday or company holiday that affects leave calculations and payroll processing.

**Fields:**

- `id` (number): Unique identifier
- `name` (string): Name of the holiday (e.g., "New Year's Day", "Independence Day")
- `date` (Date): Date of the holiday
- `description` (string): Optional description of the holiday
- `isActive` (boolean): Whether the holiday is active

**Business Purpose:** Defines holidays that are excluded from leave day calculations and used in payroll processing. When employees request leave, holidays within the leave period do not count toward their leave balance deduction.

**Repository Operations:**

- `create(holiday, context)` - Create a new holiday
- `update(id, dto, context)` - Update holiday details
- `findById(id, context)` - Retrieve by ID
- `findByDateRange(startDate, endDate, context)` - Find holidays within date range (key for leave calculations)
- `findByYear(year, context)` - Get all holidays for a specific year
- `findPaginatedList(term, page, limit, context)` - Search and paginate holidays
- `softDelete(id, isActive, context)` - Deactivate a holiday

**Important Rules:**

- Holidays are automatically excluded from leave day calculations
- Only active holidays (`isActive = true`) are considered in calculations
- Duplicate holidays on the same date are prevented
- Holidays apply globally to all employees
- **Shared Domain**: Holidays are managed in the shared domain and can be used by leave management, payroll, and other domains

---

## Business Processes

### Process Flow Overview

The Leave Management domain operates in a cyclical manner with the following key processes:

1. **Initial Setup** (Process 0): Configure leave year cutoff periods, leave types, policies, and initialize balances for all employees
2. **Daily Operations** (Process 1): Handle leave requests, approvals, and ongoing balance updates (uses cutoff-based year lookup)
3. **Year-End Processing** (Process 2): Close current leave year balances, carry over unused leave, initialize new leave year with new cutoff configuration
4. **Leave Encashment** (Process 3): Convert unused leave to cash compensation
5. **Policy Management** (Process 4): Create, activate, and update leave policies
6. **Leave Cycle Management** (Process 5): Manage multi-year leave cycles and cycle-based carry-over
7. **Leave Balance Management** (Process 6): Create, query, close, and maintain leave balances

### Process Sequence Diagram

```
System Lifecycle:
┌─────────────────────────────────────────────────────────────┐
│ Phase 0: Initial Setup                                    │
│ • Configure Leave Year Cutoff Periods                     │
│ • Configure LeaveTypes                                     │
│ • Create and Activate Policies                             │
│ • Initialize Balances for All Employees                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Ongoing Operations (Throughout Year)             │
│ • Process Leave Requests                                   │
│ • Approve/Reject Requests                                  │
│ • Handle Encashments                                       │
│ • Update Balances in Real-Time                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Year-End Processing                               │
│ • Create New Cutoff Configuration (if dates changed)      │
│ • Close Current Leave Year Balances (Process 6)           │
│ • Calculate Carry-Over                                     │
│ • Close Completed Cycles (Process 5)                      │
│ • Generate New Leave Year Balances (Process 6)            │
│ • Start New Cycles (Process 5)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
         (Return to Phase 1 for next year)
```

---

### Process 0: Initial System Setup (Start from Scratch)

This process establishes the leave management system for the first time.

#### Phase 1: Configuration Setup

1. **Define Leave Year Configuration**

   - Create LeaveYearConfiguration for the initial leave year period
   - Set cutoff start date and end date (e.g., Nov 26, 2023 to Nov 25, 2024)
   - System automatically generates leave year identifier (e.g., "2023-2024")
   - Set `isActive = true`

   **Entities Created:**

   ```
   LeaveYearConfiguration:
   - cutoffStartDate: Nov 26, 2023
   - cutoffEndDate: Nov 25, 2024
   - year: "2023-2024"
   - isActive: true
   ```

2. **Define Leave Types**

   - Create LeaveType entities for all leave categories
   - Example types: Annual Vacation (VL), Sick Leave (SL), Personal Leave (PL), Unpaid Leave (UL)
   - Set `isActive = true` for active types
   - Use `code` field for short identifiers (e.g., "VL", "SL", "PL", "UL")

   **Entities Created:**

   ```
   LeaveType: VL, SL, PL, UL (all with isActive=true)
   ```

3. **Create Leave Policies**

   - For each LeaveType, create a LeavePolicy with status DRAFT
   - Define policy parameters:
     - `annualEntitlement`: Days granted per year
     - `carryLimit`: Maximum carry-over days
     - `encashLimit`: Maximum encashable days
     - `cycleLengthYears`: Duration of policy cycle
   - Set `effectiveDate` and `expiryDate` (typically multi-year span)
   - Activate policies (status: ACTIVE)

   **Example Policy:**

   ```
   LeavePolicy for "Annual Vacation":
   - annualEntitlement: 15 days
   - carryLimit: 5 days
   - encashLimit: 10 days
   - cycleLengthYears: 1 year
   - status: ACTIVE
   ```

#### Phase 2: Historical Data Setup (If Applicable)

3. **Create Leave Cycles for Existing Employees**

   - Identify all active employees
   - For each employee and each active LeavePolicy:
     - Determine cycle start year (hire date year, policy effective date year, or current year)
     - Calculate cycle end year: `cycleStartYear + policy.cycleLengthYears - 1`
     - Create LeaveCycle with status: ACTIVE
     - See Process 5: Scenario A for detailed cycle creation steps

   **Entities Created:**

   ```
   LeaveCycle per employee per active policy (status: ACTIVE)
   ```

   **Note:** For detailed cycle creation process, see Process 5: Leave Cycle Management, Scenario A.

#### Phase 3: Initial Balance Setup

4. **Initialize Current Leave Year Balances**

   - Get active cutoff configuration for current date
   - For each active employee:
     - For each active LeavePolicy:
       - Get the active policy for their leave type
       - Calculate current date's position in leave year period
       - Determine beginning balance (may be pro-rated for new employees)
       - Create LeaveBalance (see Process 6: Scenario A for detailed steps):
         - `earned`: Set to policy.annualEntitlement (or pro-rated)
         - `used`: 0 (no leave taken yet)
         - `carriedOver`: 0 (first leave year, no prior balance)
         - `encashed`: 0
         - `remaining`: earned
         - `status`: OPEN
         - `year`: current leave year identifier (e.g., "2023-2024")

   **Entities Created:**

   ```
   LeaveBalance per employee per active policy per year (status: OPEN)
   ```

   **Note:** For detailed balance generation process, see Process 6: Leave Balance Management, Scenario A.

5. **Pro-rate Entitlements for Mid-Year Hires**
   - For employees hired mid-year:
     - Calculate months worked in current year
     - Pro-rate annual entitlement
     - Example: If hired in July (6 months), VL entitlement = 15 days \* (6/12) = 7.5 days

#### Phase 4: System Verification

6. **Verify System Integrity**
   - Check all employees have balances for all active policies
   - Verify balance calculations: `remaining = earned + carriedOver - used - encashed`
   - Ensure all balances have status: OPEN
   - Validate policy assignments are correct

**System is now ready for operational use.**

---

### Process 1: Leave Request Workflow

This process manages the complete lifecycle of employee leave requests, from initial submission through approval/rejection to cancellation. The workflow ensures proper balance validation, manager approval, and automatic balance updates.

#### Overview: How Leave Request Workflow Works

The leave request workflow enables employees to request time off and managers to approve or reject those requests. Key features include:

- **Request Submission**: Employees submit leave requests with dates and reasons
- **Balance Validation**: System validates sufficient balance before approval
- **Manager Approval**: Managers review and approve/reject requests with remarks
- **Automatic Updates**: Approved requests automatically update leave balances
- **Transaction Logging**: All approvals create audit trail transactions
- **Request Cancellation**: Employees can cancel pending requests

**Important Rule:**

```
Balance deduction happens ONLY when request is APPROVED.
Pending requests do NOT affect balance.
Cancelled requests restore balance if previously approved.
```

#### Scenario A: Employee Submits Leave Request

This scenario handles the initial creation of a leave request by an employee.

1. **Employee Initiates Request**

   - Employee selects:
     - Leave type (e.g., Vacation Leave, Sick Leave)
     - Start date (first day of leave)
     - End date (last day of leave)
     - Reason for leave (optional but recommended)
     - Half-day option (optional): `isHalfDay` flag for half-day leave
   - System calculates total days requested

2. **Validate Request Dates**

   - **Start Date Validation**:
     - Start date must be >= today (cannot request past dates)
     - Start date must be <= end date
   - **End Date Validation**:
     - End date must be >= start date
     - End date should be reasonable (future dates)
   - **Half-Day Leave Validation**:
     - If `isHalfDay = true`, start date and end date must be the same
     - Half-day leave calculates `totalDays = 0.5`
     - Full-day leave with same start/end date calculates `totalDays = 1`
   - **Date Range Validation**:
     - Calculate `totalDays`:
       - If `isHalfDay = true` and `startDate === endDate`: `totalDays = 0.5`
       - Otherwise: `totalDays = (endDate - startDate + 1) - holidayCount` (calendar days minus holidays)
       - System automatically fetches holidays in the date range and excludes them from calculation
     - Validate totalDays > 0
     - Supports fractional days (0.5, 1.5, etc.) for half-day and multi-day half-day leaves
     - Holidays do not count toward leave balance deduction

   **Examples:**

   ```
   Full-Day Leave:
   Start Date: January 15, 2024
   End Date: January 20, 2024
   Total Days: 6 days (15, 16, 17, 18, 19, 20)

   Half-Day Leave:
   Start Date: January 15, 2024
   End Date: January 15, 2024
   isHalfDay: true
   Total Days: 0.5 days

   Multi-Day with Half-Day:
   Start Date: January 15, 2024
   End Date: January 17, 2024
   isHalfDay: true (only if startDate === endDate)
   Total Days: 2.5 days (if allowed by business rules)
   ```

   **Important Notes:**

   - Holidays are automatically excluded from totalDays calculation
   - Weekends are still counted (only holidays are excluded)
   - Fractional days are supported for half-day leaves
   - Half-day validation requires same start and end dates

3. **Retrieve and Validate Leave Balance**

   - Get active cutoff configuration for the start date
   - Calculate leave year identifier from cutoff configuration
   - Query LeaveBalance for:
     - `employeeId`: Requesting employee
     - `leaveTypeId`: Selected leave type
     - `year`: Leave year identifier (e.g., "2023-2024") calculated from cutoff
   - Validate balance exists and is OPEN
   - Check sufficient balance: `totalDays ≤ balance.remaining`

   **Validation Rules:**

   ```
   If balance.remaining < totalDays:
     → Throw error: "Insufficient leave balance"
     → Request cannot be created

   If balance.status != OPEN:
     → Throw error: "Balance is closed, cannot create request"
     → Request cannot be created
   ```

   **Example:**

   ```
   Start Date: January 15, 2024
   Active Cutoff: Nov 26, 2023 to Nov 25, 2024
   Leave Year: "2023-2024"

   Requested: 5 days
   Balance.remaining: 10 days
   Result: ✓ Valid (10 ≥ 5)

   Requested: 8 days
   Balance.remaining: 5 days
   Result: ✗ Invalid (5 < 8)
   ```

4. **Validate No Overlapping Requests**

   - Check for existing leave requests with overlapping date ranges:
     - Query all active requests for the same employee where:
       - Status is PENDING or APPROVED (CANCELLED/REJECTED don't block)
       - Date ranges overlap: `newStartDate <= existingEndDate AND existingStartDate <= newEndDate`
   - If overlapping requests found: Throw error with details
   - This prevents employees from having multiple leave periods that conflict

   **Overlap Validation Rules:**

   ```
   Two date ranges overlap if:
   newStartDate <= existingEndDate AND existingStartDate <= newEndDate

   Example Overlaps:
   - Request 1: Jan 15-20, Request 2: Jan 18-25 → OVERLAP
   - Request 1: Jan 15-20, Request 2: Jan 21-25 → NO OVERLAP
   - Request 1: Jan 15-20, Request 2: Jan 10-15 → OVERLAP (end date touches start date)
   ```

   **Important:**

   - Only PENDING and APPROVED requests block new requests
   - CANCELLED and REJECTED requests do not prevent overlaps
   - Overlap check ensures employees cannot be on leave twice simultaneously

5. **Create LeaveRequest Record**

   - Create LeaveRequest with:
     - `employeeId`: Employee ID
     - `leaveTypeId`: Selected leave type ID
     - `leaveType`: Leave type name (denormalized)
     - `startDate`: First day of leave
     - `endDate`: Last day of leave
     - `totalDays`: Calculated number of days (supports fractional for half-days)
     - `reason`: Employee's reason for leave
     - `balanceId`: Reference to the balance being used
     - `status`: PENDING
     - `approvalDate`: null (set when approved/rejected)
     - `approvalBy`: null (set when approved/rejected)
     - `remarks`: Empty (set by manager during approval)
     - `isActive`: true

6. **Important: Balance Not Updated Yet**

   - Balance `remaining` and `used` fields remain unchanged
   - Balance deduction happens only when request is APPROVED
   - Pending requests do not reserve or block balance days

**Integration:**

- **Process 6: Scenario D**: Uses balance query to validate sufficient balance
- Balance validation ensures employee has enough days available

**Status After Submission:**

```
LeaveRequest.status: PENDING
Balance.remaining: Unchanged
Balance.used: Unchanged
```

#### Scenario B: Manager Reviews Pending Requests

This scenario covers how managers view and access pending leave requests for review.

1. **Retrieve Pending Requests**

   - Query all LeaveRequest records where:
     - `status` = PENDING
     - `isActive` = true
   - Optional filters:
     - By employee (specific employee's requests)
     - By date range (requests within specific period)
     - By leave type (specific leave types)

2. **Display Request Details**

   - For each pending request, show:
     - Employee name and ID
     - Leave type
     - Start date and end date
     - Total days requested
     - Reason for leave
     - Current balance available (for reference)
     - Request submission date

3. **Manager Actions Available**

   - **Approve Request**: Approve with optional remarks
   - **Reject Request**: Reject with required remarks (reason for rejection)
   - **View Balance**: Check employee's current balance for context
   - **View History**: See employee's past leave requests

**Query Operations:**

- `findPending(context)`: Get all pending requests
- `findByEmployee(employeeId, context)`: Get all requests for an employee
- `findPaginatedList(term, page, limit)`: Search and paginate requests

#### Scenario C: Manager Approves Leave Request

This scenario handles the approval of a leave request, which triggers balance deduction and transaction creation.

1. **Validate Request Status**

   - Retrieve LeaveRequest by ID
   - Verify status is PENDING (cannot approve already approved/rejected/cancelled)
   - If status != PENDING: Throw error (invalid state transition)

2. **Re-validate Balance (Pre-approval Check)**

   - Get current LeaveBalance using `balanceId`
   - Verify balance still has sufficient days: `balance.remaining >= request.totalDays`
   - If insufficient: Throw error (balance may have changed since request creation)

   **Why Re-validate?**

   ```
   Balance may have changed between request creation and approval:
   - Employee may have encashed leave
   - Another request may have been approved
   - Administrative adjustments may have occurred
   ```

3. **Update Request Status to APPROVED**

   - Update LeaveRequest:
     - `status`: APPROVED (from PENDING)
     - `approvalDate`: Current date/time
     - `approvalBy`: Manager's employee ID
     - `remarks`: Optional approval remarks from manager

4. **Deduct Days from Balance**

   - Update LeaveBalance:
     - `used`: balance.used + request.totalDays
     - `remaining`: balance.remaining - request.totalDays
     - `lastTransactionDate`: Current date

   **Balance Formula Applied:**

   ```
   New remaining = (earned + carriedOver) - (used + request.totalDays) - encashed
   ```

   **Example:**

   ```
   Before Approval:
   - earned: 15 days
   - carriedOver: 5 days
   - used: 3 days
   - encashed: 2 days
   - remaining: (15 + 5) - (3 + 2) = 15 days

   Request: 5 days

   After Approval:
   - used: 3 + 5 = 8 days
   - remaining: 15 - 5 = 10 days
   ```

5. **Create LeaveTransaction Record**

   - Create LeaveTransaction:
     - `balanceId`: Balance ID
     - `transactionType`: REQUEST
     - `days`: -request.totalDays (negative, deduction)
     - `remarks`: "Leave request approved - {request.totalDays} days from {startDate} to {endDate}"
     - `isActive`: true

6. **Send Notification (Optional)**

   - Notify employee of approval
   - Include request details and manager remarks
   - Can trigger email, SMS, or in-app notification

**Status Transition:**

```
PENDING → APPROVED
```

**Integration:**

- **Process 6**: Balance updated through authorized process
- Balance `used` field incremented
- Balance `remaining` field decremented
- Transaction audit trail created

#### Scenario D: Manager Rejects Leave Request

This scenario handles the rejection of a leave request. Unlike approval, rejection does not affect balance.

1. **Validate Request Status**

   - Retrieve LeaveRequest by ID
   - Verify status is PENDING (cannot reject already approved/rejected/cancelled)
   - If status != PENDING: Throw error

2. **Update Request Status to REJECTED**

   - Update LeaveRequest:
     - `status`: REJECTED (from PENDING)
     - `approvalDate`: Current date/time
     - `approvalBy`: Manager's employee ID
     - `remarks`: **Required** - rejection reason from manager

   **Important:**

   ```
   Rejection remarks are REQUIRED.
   Manager must provide reason for rejection.
   ```

3. **Balance Remains Unchanged**

   - LeaveBalance is NOT modified
   - No transaction created
   - Balance `remaining` and `used` remain as they were

4. **Send Notification (Optional)**

   - Notify employee of rejection
   - Include rejection reason (remarks)
   - Inform employee they can create new request if needed

**Status Transition:**

```
PENDING → REJECTED
```

**Why No Balance Change?**

```
Rejected requests never consumed balance, so no restoration needed.
Balance was never deducted because request was never approved.
```

#### Scenario E: Employee Cancels Leave Request

This scenario handles cancellation of leave requests by employees. Cancellation behavior differs based on request status.

**Sub-scenario E1: Cancel PENDING Request**

1. **Validate Request Status**

   - Retrieve LeaveRequest by ID
   - Verify status is PENDING
   - Verify employee owns the request (cannot cancel others' requests)
   - If status != PENDING: May not be cancellable

2. **Update Request Status to CANCELLED**

   - Update LeaveRequest:
     - `status`: CANCELLED (from PENDING)
     - `remarks`: "Cancelled by employee"
     - Optional: Record cancellation date

3. **No Balance Impact**

   - Balance remains unchanged (was never deducted)
   - No transaction created
   - Request is simply marked as cancelled

**Status Transition:**

```
PENDING → CANCELLED
```

**Sub-scenario E2: Cancel APPROVED Request (Reversal)**

**Note:** This is an advanced scenario that may or may not be supported depending on business rules.

1. **Validate Cancellation Eligibility**

   - Retrieve LeaveRequest by ID
   - Verify status is APPROVED
   - Verify employee owns the request
   - Check if cancellation is allowed:
     - Policy may restrict cancellation of past-dated leaves
     - Policy may require manager approval for cancellation
     - Time-based restrictions may apply

2. **Check Balance Status**

   - Get LeaveBalance referenced by request
   - Verify balance is still OPEN (cannot reverse on closed balance)
   - If balance is CLOSED: May require reopening first

3. **Update Request Status to CANCELLED**

   - Update LeaveRequest:
     - `status`: CANCELLED (from APPROVED)
     - `remarks`: "Cancelled by employee - balance restored"

4. **Restore Balance (Reverse Deduction)**

   - Update LeaveBalance:
     - `used`: balance.used - request.totalDays (restore)
     - `remaining`: balance.remaining + request.totalDays (restore)
     - `lastTransactionDate`: Current date

5. **Create Reversal Transaction**

   - Create LeaveTransaction:
     - `balanceId`: Balance ID
     - `transactionType`: REQUEST (or ADJUSTMENT)
     - `days`: +request.totalDays (positive, restoration)
     - `remarks`: "Leave request cancelled - {totalDays} days restored"
     - `isActive`: true

**Status Transition:**

```
APPROVED → CANCELLED
```

**Important:**

```
Cancellation of approved requests restores balance.
This is a reversal operation that undoes the approval.
```

#### Scenario F: Employee Updates Leave Request

This scenario allows employees to modify PENDING leave requests before they are approved or rejected.

**Important Rule:**

```
Only PENDING requests can be updated.
APPROVED, REJECTED, or CANCELLED requests cannot be modified.
```

1. **Validate Request Status**

   - Retrieve LeaveRequest by ID
   - Verify status is PENDING (cannot update already approved/rejected/cancelled)
   - If status != PENDING: Throw error

2. **Handle Leave Type Change (if applicable)**

   - If leave type is being changed:
     - Validate new leave type exists and is active
     - Find balance for new leave type (for the year of updated start date)
     - Verify new balance is OPEN
     - Verify new balance has sufficient days for requested totalDays
     - Update `leaveTypeId`, `leaveType`, and `balanceId` to reference new balance

3. **Handle Date and Days Updates (if applicable)**

   - If dates are being updated:
     - Validate new start date >= today
     - Validate new start date <= new end date
     - Recalculate `totalDays` based on new dates:
       - If `isHalfDay = true` and `startDate === endDate`: `totalDays = 0.5`
       - Otherwise: `totalDays = endDate - startDate + 1`
     - Or use provided `totalDays` if explicitly specified (supports fractional days)
   - Validate half-day logic if `isHalfDay = true`: dates must be the same

4. **Validate Balance for Updated Request**

   - If `totalDays` changed or leave type changed:
     - Get balance (may be new balance if leave type changed)
     - Verify balance status is OPEN
     - Verify `balance.remaining >= newTotalDays`
     - If insufficient: Throw error

5. **Validate No Overlapping Requests (if dates changed)**

   - If dates are being updated:
     - Check for existing leave requests with overlapping date ranges:
       - Query all active requests for the same employee where:
         - Status is PENDING or APPROVED (CANCELLED/REJECTED don't block)
         - Date ranges overlap with new dates: `newStartDate <= existingEndDate AND existingStartDate <= newEndDate`
         - Exclude the current request being updated (by request ID)
     - If overlapping requests found: Throw error with details of overlapping requests
     - This prevents employees from updating to dates that conflict with existing leave periods

   **Overlap Validation Rules:**

   ```
   Two date ranges overlap if:
   newStartDate <= existingEndDate AND existingStartDate <= newEndDate

   The current request being updated is excluded from the overlap check.
   Only PENDING and APPROVED requests block updates to overlapping dates.
   ```

6. **Handle Reason Update (if applicable)**

   - If reason is being updated:
     - Update `reason` field with new value

7. **Update LeaveRequest Record**

   - Update LeaveRequest with changed fields:
     - `leaveTypeId`, `leaveType`, `balanceId` (if leave type changed)
     - `startDate`, `endDate`, `totalDays` (if dates/days changed)
     - `reason` (if reason changed)
   - Note: Status remains PENDING after update

**Important Notes:**

- Overlapping validation is performed when dates are updated to prevent conflicts with existing requests
- Balance is re-validated if dates or days change to ensure sufficient balance
- Leave type changes require finding and validating new balance
- All validation rules from Scenario A apply (date validation, balance validation, overlap validation, etc.)

**Use Cases:**

- Employee wants to change leave dates before approval
- Employee wants to change from full-day to half-day leave
- Employee wants to change leave type (e.g., from Vacation to Sick Leave)
- Employee wants to correct request details before manager reviews

#### Scenario G: Querying Leave Requests

This scenario covers read-only operations to retrieve leave requests for display, reporting, and validation.

**Operation 1: Find Requests by Employee**

- Purpose: Get all leave requests for a specific employee
- Input: `employeeId`
- Output: Array of LeaveRequest records (all statuses)
- Use cases:
  - Employee dashboard (show own requests)
  - Employee leave history
  - Leave usage reports

**Operation 2: Find Pending Requests**

- Purpose: Get all pending requests awaiting approval
- Input: None (or optional filters)
- Output: Array of LeaveRequest records (status: PENDING)
- Use cases:
  - Manager approval queue
  - Pending requests dashboard
  - Approval workflow

**Operation 3: Find Request by ID**

- Purpose: Get specific request details
- Input: `requestId`
- Output: Single LeaveRequest or null
- Use cases:
  - Request detail view
  - Approval/rejection form
  - Request validation

**Operation 4: Find Paginated List**

- Purpose: Search and paginate requests with filters
- Input: `term` (search), `page`, `limit`
- Output: Paginated result with metadata
- Use cases:
  - Admin request management
  - Reporting and analytics
  - Search functionality

**Operation 5: Find Overlapping Requests**

- Purpose: Check for overlapping leave requests (internal use)
- Input: `employeeId`, `startDate`, `endDate`, `excludeId` (optional)
- Output: Array of LeaveRequest records that overlap with given date range
- Use cases:
  - Validation during request creation
  - Validation during request update (if implemented)

**Important Notes:**

- All query operations are **read-only** - no request modifications
- Queries support filtering by status, employee, date range, leave type
- Used extensively in dashboards, reports, and approval workflows

#### Integration with Other Processes

**Process 0: Initial Setup**

- No direct integration (requests created after system setup)

**Process 1: Leave Request Workflow**

- Self-contained process for request lifecycle

**Process 2: Year-End Processing**

- Requests from closed year should be finalized before balance closure
- Historical requests preserved for reporting

**Process 3: Leave Encashment**

- Requests and encashments both consume balance
- Both validated against available balance

**Process 6: Leave Balance Management**

- **Scenario D**: Uses balance query to validate sufficient balance before approval
- **Scenario C**: Updates balance when request approved (only authorized balance update)
- Balance `used` field incremented on approval
- Balance `remaining` field decremented on approval

#### Leave Request Management Rules Summary

- **Balance Validation**: Request days must be ≤ remaining balance at submission and approval
- **Status Transitions**: PENDING → APPROVED/REJECTED/CANCELLED (terminal states)
- **Balance Deduction**: Only occurs on APPROVAL, not on submission
- **Balance Restoration**: Cancellation of APPROVED requests restores balance
- **Transaction Logging**: All approvals create REQUEST transactions
- **No Double-Deduction**: Each approved request deducts balance exactly once
- **Re-validation**: Balance re-checked at approval time (may have changed)
- **Overlapping Prevention**: Employees cannot have overlapping leave periods (only PENDING/APPROVED requests block)
  - Overlap validation occurs during request creation and during request update when dates are changed
  - Current request being updated is excluded from overlap check to allow date modifications
- **Half-Day Support**: System supports half-day leaves (0.5 days) when startDate === endDate and isHalfDay = true
- **Request Updates**: Only PENDING requests can be updated; balance, dates, and overlapping requests are re-validated on update
- **Fractional Days**: System supports fractional totalDays (0.5, 1.5, etc.) for half-day and multi-day half-day leaves

**Request Lifecycle Diagram:**

```
Employee Submits
        ↓
    PENDING Status
        ↓
    ┌─────┴─────┬─────────┐
    ↓           ↓         ↓
Manager      Employee  Employee
Approves     Cancels    Updates
    ↓           ↓         ↓
APPROVED    CANCELLED  PENDING
    ↓           │       (Remains)
Balance      (No Balance
Updated         Change)
    ↓           │
Transaction    └──┘
Created
```

---

### Process 2: Year-End Processing & New Year Initialization

This process runs at the end of each year to close current year and prepare for the next year.

#### Step 1: Year-End Closure

1. **Identify Balances to Close**

   - Get active cutoff configuration for the current date
   - Determine which leave year is ending based on cutoff period
   - Query all LeaveBalance records with status OPEN and the ending leave year identifier
   - Filter to include all active employees
   - See Process 6: Scenario C for detailed closing process

2. **Calculate Carry-Over for Each Balance**

   - For each balance:
     - Get remaining days at year-end
     - Check if within policy.carryLimit
     - If remaining > carryLimit: carryOver = carryLimit (excess is forfeited)
     - If remaining ≤ carryLimit: carryOver = remaining

   **Example:**

   ```
   Balance: Vacation Leave 2023
   - remaining: 8 days
   - policy.carryLimit: 5 days
   - carryOver for 2024: 5 days (3 days forfeited)
   ```

3. **Close Current Year Balances**

   - For each OPEN balance:
     - Update status to CLOSED
     - Set carriedOver = calculated carry-over
     - Record lastTransactionDate = current date
     - Update any final remarks

4. **Create Transaction Records**

   - For each balance with carry-over > 0:
     - Create LeaveTransaction with type: CARRY
     - days: carriedOver amount
     - remarks: "Carried over from previous year"

5. **Close Completed Cycles**
   - Identify LeaveCycles where cycleEndYear = current year (see Process 5: Scenario C)
   - For each cycle ending:
     - Calculate final carry-over (respecting carry limits)
     - Update totalCarried with final cumulative amount
     - Update status to COMPLETED
   - Record any forfeited days for reporting

#### Step 2: New Year Initialization

6. **Create New Balances**

   - Get or create new cutoff configuration for the next leave year period
   - For each active employee:
     - For each active LeavePolicy:
       - Get the active policy for leave type
       - Generate new year balances (see Process 6: Scenario A for detailed steps)
       - Create LeaveBalance for new leave year:
         - `earned`: policy.annualEntitlement
         - `used`: 0
         - `carriedOver`: from previous leave year's calculation
         - `encashed`: 0
         - `remaining`: earned + carriedOver
         - `status`: OPEN
         - `year`: new leave year identifier (e.g., "2024-2025")
         - `beginningBalance`: 0 (or set to carriedOver if tracking separately)

7. **Start New Cycles (if needed)**

   - Check if new cycle should start (based on cycleLengthYears and completed cycles)
   - For each employee and leave type where previous cycle was COMPLETED:
     - Calculate new cycle dates (see Process 5: Scenario D)
     - Create new LeaveCycle with status: ACTIVE
     - Set cycleStartYear and cycleEndYear
   - For new employees without cycles:
     - Create initial cycles (see Process 5: Scenario A)

8. **Mid-Year Hire Handling**
   - For employees hired during the year:
     - Pro-rate earned entitlement based on hire date
     - Example: Hired June 1, VL policy = 15 days/year → earned = 15 \* (7/12) = 8.75 days

#### Step 3: Balance Verification

9. **Verify New Balances**
   - Check all employees have balances for all active policies
   - Verify formula: `remaining = earned + carriedOver - used - encashed`
   - Ensure all new balances have status: OPEN
   - Validate carry-over amounts are within limits

**Output:**

- Previous year balances: status = CLOSED
- New year balances: status = OPEN with proper carry-over
- New year transactions: CARRY transactions recorded

### Process 3: Leave Encashment Workflow

This process allows employees to convert unused leave days to cash compensation.

#### Step 1: Encashment Request

1. **Employee Initiates Request**

   - Employee selects leave type to encash
   - Specifies number of days to encash
   - System loads current LeaveBalance

2. **Validate Encashment Eligibility**

   - Check `balance.remaining > 0`
   - Check `balance.remaining >= requestedDays`
   - Validate policy.encashLimit constraint:
     - Current encashed = balance.encashed
     - New total = balance.encashed + requestedDays
     - Constraint: new total ≤ policy.encashLimit

   **Example Validation:**

   ```
   Balance.remaining: 10 days
   Balance.encashed: 2 days
   Policy.encashLimit: 8 days
   Requested: 5 days

   Check: (2 + 5) ≤ 8 → 7 ≤ 8 ✓ VALID

   If requested 7 days: (2 + 7) ≤ 8 → 9 ≤ 8 ✗ INVALID
   ```

3. **Calculate Encashment Amount**

   - Get employee's daily rate from Employee entity or payroll system
   - Calculate amount = dailyRate × requestedDays

   **Example:**

   ```
   Daily Rate: PHP 2,000
   Days: 5 days
   Amount: PHP 10,000
   ```

4. **Create Encashment Record**
   - Create LeaveEncashment with:
     - `employeeId`: employee ID
     - `balanceId`: current balance ID
     - `totalDays`: requested days
     - `amount`: calculated amount
     - `status`: PENDING
     - `isActive`: true

#### Step 2: Update Balance & Create Transaction

5. **Deduct from Balance**

   - Update LeaveBalance:
     - `encashed`: balance.encashed + requestedDays
     - `remaining`: balance.remaining - requestedDays
     - `lastTransactionDate`: current date

   **Balance Formula Applied:**

   ```
   remaining = (earned + carriedOver) - (used + encashed)
   ```

6. **Create Transaction Record**
   - Create LeaveTransaction:
     - `balanceId`: balance ID
     - `transactionType`: ENCASHMENT
     - `days`: -requestedDays (negative, deduction)
     - `remarks`: "Leave encashment - {requestedDays} days"
     - `isActive`: true

#### Step 3: Payment Processing

7. **Send to Payroll**

   - Reference encashment record in payroll system
   - Include: employeeId, amount, totalDays, encashmentId
   - Send notification to payroll department

8. **Process Payment**

   - Payroll processes encashment
   - Updates payroll system with payment reference
   - Marks LeaveEncashment as PAID

   **Update Encashment Record:**

   - `status`: PAID
   - Add `payrollRef`: payroll transaction reference

#### Step 4: Verification

9. **Verify Transaction**
   - Check balance remaining is correct
   - Verify transaction was recorded
   - Confirm encashment status is PAID

**Success Criteria:**

- Balance updated correctly
- Transaction logged
- Encashment marked as PAID
- Payroll reference recorded

**Alternative Outcomes:**

- If encashment is CANCELLED before payment:
  - Reverse balance deduction (add days back)
  - Create adjustment transaction
  - Mark encashment status: CANCELLED

### Process 4: Policy Management

This process manages the lifecycle of leave policies, including creation, activation, and retirement.

#### Scenario A: Creating a New Policy

1. **Define Policy Parameters**

   - Select target LeaveType
   - Set `annualEntitlement`: Days granted per year
   - Set `carryLimit`: Maximum days that can be carried over
   - Set `encashLimit`: Maximum days that can be encashed
   - Set `cycleLengthYears`: Duration of the policy cycle (typically 1, 2, or 3 years)
   - Set `effectiveDate`: When policy becomes active
   - Set `expiryDate`: When policy expires

2. **Create Policy in DRAFT Status**
   - Create LeavePolicy with status: DRAFT
   - Policy is not yet active, allows editing
   - No balances will reference this policy until activated

#### Scenario B: Activating a Policy

3. **Validate Activation Readiness**

   - Check that expiryDate > effectiveDate
   - Verify policy parameters are reasonable
   - Ensure no gaps in coverage (dates should overlap or be continuous)

4. **Deactivate Old Policy**

   - Find existing ACTIVE policy for same LeaveType
   - Update old policy status to RETIRED
   - Record retirement date and reason
   - Important: Existing balances keep reference to old policy

5. **Activate New Policy**

   - Update new policy status to ACTIVE
   - Policy is now eligible for assignment to new balances
   - Only one policy per leave type can be ACTIVE

6. **Handle Policy Overlap**
   - If dates overlap, system selects policy based on effectiveDate
   - New balances use policy active at their creation date
   - Existing balances are unaffected by policy changes

**Important Rule:**

```
Only ONE policy per leave type can be ACTIVE at any time
When new policy activated → old policy automatically RETIRED
```

#### Scenario C: Suspending a Policy

7. **Temporarily Suspend Policy**
   - Update policy status to INACTIVE
   - Policy remains in system but not used for new balances
   - Existing balances remain tied to this policy
   - Can be reactivated later if needed

#### Scenario D: Retiring a Policy

8. **Retire a Policy**
   - Mark policy status: RETIRED
   - This is a permanent state
   - Policy cannot be reactivated
   - Create new policy if needed for future coverage

#### Scenario E: Updating Policy Parameters

9. **Update Existing Policy**
   - Only DRAFT or INACTIVE policies can be updated
   - ACTIVE policies cannot be modified (create new policy instead)
   - Update desired fields
   - Changes affect only new balances created after update

**Policy Lifecycle Summary:**

```
DRAFT → (activate) → ACTIVE → (suspend) → INACTIVE → (reactivate) → ACTIVE
                          ↓
                      (retire) → RETIRED (final)
```

---

### Process 5: Leave Cycle Management

This process manages multi-year leave cycles that track leave accumulation and carry-over across multiple years. Cycles are defined by policy `cycleLengthYears` and provide a framework for managing carry-over limits within a specific time period.

#### Overview: How Leave Cycles Work

A **Leave Cycle** represents a continuous period (typically 1, 2, or 3 years) during which leave carry-over rules apply. The cycle duration is determined by the policy's `cycleLengthYears` setting. Within a cycle:

- Leave can be carried over year-to-year within the carry limit
- Excess days beyond the carry limit are forfeited at cycle boundaries
- New cycles start fresh with no carry-over from previous cycles (unless policy allows)

**Key Concepts:**

- **Cycle Duration**: Defined by `policy.cycleLengthYears` (e.g., 1 year = annual reset, 3 years = three-year accumulation period)
- **Cycle Boundaries**: Transition points where old cycles end and new cycles begin
- **Carry-Over Within Cycle**: Days can be carried forward within the cycle, respecting `policy.carryLimit`
- **Cycle Completion**: When a cycle ends, excess days beyond carry limit are forfeited

#### Scenario A: Creating Initial Cycles (System Setup)

This occurs during Process 0: Initial System Setup or when a new employee joins.

1. **Identify Need for Cycle Creation**

   - Trigger: New employee hired, or initial system setup
   - For each active employee and each active LeavePolicy:
     - Check if active cycle exists
     - If no cycle exists, create one

2. **Determine Cycle Start Year**

   - Use employee hire date year, OR
   - Use policy effective date year, OR
   - Use current year (for existing employees in initial setup)
   - Choose the most recent of these dates

3. **Calculate Cycle End Year**

   - `cycleStartYear`: Determined in step 2
   - `cycleEndYear`: cycleStartYear + policy.cycleLengthYears - 1

   **Example:**

   ```
   Employee hired: 2023
   Policy cycleLengthYears: 3

   Cycle:
   - cycleStartYear: 2023
   - cycleEndYear: 2025 (2023 + 3 - 1)
   - Duration: 3 years (2023, 2024, 2025)
   ```

4. **Create LeaveCycle Record**

   - `employeeId`: Employee ID
   - `leaveTypeId`: Leave type ID
   - `leaveType`: Leave type name (denormalized)
   - `cycleStartYear`: First year of cycle
   - `cycleEndYear`: Last year of cycle
   - `totalCarried`: 0 (initialized, will be updated during year-end processing)
   - `status`: ACTIVE
   - `isActive`: true

**Entities Created:**

```
LeaveCycle per employee per active policy (status: ACTIVE)
```

#### Scenario B: Cycle Lifecycle During Active Years

Once a cycle is created, it remains active throughout its duration (from `cycleStartYear` to `cycleEndYear`).

1. **During Active Cycle Years**

   - Cycle status remains ACTIVE
   - Each year within the cycle:
     - Balances are created and managed normally
     - Carry-over calculations respect `policy.carryLimit`
     - `totalCarried` tracks cumulative carry-over within the cycle

2. **Tracking Carry-Over Within Cycle**

   - At each year-end (Process 2):
     - Calculate carry-over for each balance (respecting carry limit)
     - Update LeaveCycle.totalCarried with cumulative carry-over
     - Record carried days in next year's balance

   **Example - 3-Year Cycle:**

   ```
   Cycle: 2023-2025 (3 years), carryLimit: 5 days

   Year 2023:
   - Balance remaining: 7 days
   - Carry to 2024: min(7, 5) = 5 days
   - Cycle.totalCarried: 5 days

   Year 2024:
   - Balance remaining: 6 days
   - Carry to 2025: min(6, 5) = 5 days
   - Cycle.totalCarried: 10 days (cumulative)

   Year 2025:
   - Balance remaining: 8 days
   - Cycle ends - excess beyond carry limit forfeited
   ```

3. **No Action Required During Middle Years**

   - Cycle continues automatically
   - No status changes needed
   - Only tracking updates at year-end

#### Scenario C: Closing a Completed Cycle

When a cycle reaches its end year (`cycleEndYear`), it must be closed as part of year-end processing.

**Trigger:** Part of Process 2: Year-End Processing, Step 1.5

1. **Identify Cycles to Close**

   - Query all LeaveCycles where:
     - `status` = ACTIVE
     - `cycleEndYear` = current year (the year being closed)
   - These cycles have completed their duration

2. **Final Carry-Over Calculation**

   - For each cycle ending this year:
     - Get the balance for the cycle's last year
     - Calculate final carry-over (may be forfeited if cycle ends)
     - Update `totalCarried` with final cumulative amount

   **Important Rule:**

   ```
   When a cycle ends:
   - Days beyond carryLimit are forfeited
   - Only days within carryLimit can be carried to next cycle's first year
   - If new cycle starts immediately, carry-over must respect new cycle boundaries
   ```

3. **Close the Cycle**

   - Update LeaveCycle:
     - `status`: COMPLETED
     - `totalCarried`: Final cumulative carry-over amount
     - `isActive`: true (preserve for historical records)

4. **Record Cycle Completion**

   - Add remarks or log entry about cycle completion
   - Track any forfeited days for reporting

**Example:**

```
Cycle: 2023-2025 (ending in 2025)
Final year balance remaining: 8 days
Policy carryLimit: 5 days

Action:
- Cycle status → COMPLETED
- totalCarried: 10 days (cumulative over 3 years)
- 3 days forfeited (8 - 5 = 3 excess)
- If new cycle starts: 5 days carried to 2026
```

#### Scenario D: Starting a New Cycle

A new cycle starts immediately after the previous cycle ends, or when policy changes require a new cycle.

1. **Determine When New Cycle is Needed**

   **Scenario D1: Cycle Completes Normally**

   - Previous cycle reached `cycleEndYear`
   - Previous cycle status changed to COMPLETED
   - New cycle should start in the next year

   **Scenario D2: Policy Changes Require New Cycle**

   - New policy activated with different `cycleLengthYears`
   - Existing cycle should be closed early (optional)
   - New cycle starts with new policy's cycle length

   **Scenario D3: Employee Joins Mid-Cycle**

   - New employee hired during an existing cycle period
   - Start new cycle from hire date (not from cycle boundary)
   - Cycle duration still follows policy.cycleLengthYears

2. **Calculate New Cycle Dates**

   **For Normal Cycle Completion:**

   ```
   Previous cycle: 2023-2025
   New cycle start: 2026
   New cycle end: 2026 + cycleLengthYears - 1
   ```

   **For Mid-Cycle Employee Hire:**

   ```
   Employee hired: July 2024
   Policy cycleLengthYears: 3

   New cycle:
   - cycleStartYear: 2024
   - cycleEndYear: 2026 (2024 + 3 - 1)
   - Note: Starts in hire year, not aligned with other cycles
   ```

   **For Policy Change:**

   ```
   Old policy: cycleLengthYears = 1 (ended in 2024)
   New policy: cycleLengthYears = 3

   New cycle:
   - cycleStartYear: 2025
   - cycleEndYear: 2027 (2025 + 3 - 1)
   ```

3. **Handle Carry-Over from Previous Cycle**

   - If previous cycle ended:
     - Get final balance from previous cycle's last year
     - Apply carry limit: `carriedOver = min(previousBalance.remaining, policy.carryLimit)`
     - Excess beyond carry limit is forfeited
   - If starting fresh (new employee):
     - `carriedOver = 0`

4. **Create New LeaveCycle**

   - Create new LeaveCycle with:
     - `employeeId`: Employee ID
     - `leaveTypeId`: Leave type ID (may be same or different if policy changed)
     - `leaveType`: Leave type name
     - `cycleStartYear`: Calculated start year
     - `cycleEndYear`: Calculated end year
     - `totalCarried`: 0 (will be updated as years progress)
     - `status`: ACTIVE
     - `isActive`: true

5. **Initialize First Year Balance**

   - As part of Process 2: New Year Initialization:
     - Create LeaveBalance for cycle's first year
     - Set `carriedOver` from previous cycle (if applicable)
     - Set `earned` = policy.annualEntitlement
     - Set `status` = OPEN

**Example - Complete Cycle Transition:**

```
Previous Cycle (2023-2025):
- Status: ACTIVE → COMPLETED (in 2025 year-end)
- Final balance remaining: 8 days
- Policy carryLimit: 5 days

New Cycle (2026-2028):
- Created during 2025 year-end processing
- Status: ACTIVE
- First year balance (2026):
  - earned: 15 days
  - carriedOver: 5 days (from previous cycle)
  - remaining: 20 days
  - 3 days forfeited (8 - 5 = 3 excess)
```

#### Scenario E: Handling Policy Changes Mid-Cycle

When a policy with different `cycleLengthYears` is activated, existing cycles may need adjustment.

1. **Identify Policy Change Impact**

   - Check if new policy has different `cycleLengthYears`
   - Find all ACTIVE cycles for affected leave type
   - Determine if existing cycles should continue or restart

2. **Decision: Continue vs. Restart Cycle**

   **Option 1: Continue Existing Cycle (Recommended)**

   - Existing cycles complete normally with old policy's cycle length
   - New cycles (created after policy change) use new cycle length
   - No disruption to ongoing cycles

   **Option 2: Restart Cycles (Rare)**

   - Close existing cycles early
   - Start new cycles with new cycle length
   - Requires careful handling of carry-over

3. **Update Cycle Tracking**

   - If continuing: No changes needed, cycles complete as planned
   - If restarting:
     - Close affected cycles (status: COMPLETED)
     - Calculate final carry-over
     - Create new cycles with new cycle length

**Best Practice:**

```
Policy changes should NOT disrupt active cycles.
Let existing cycles complete, apply new policy to new cycles only.
```

#### Integration with Year-End Processing

Leave cycles are integral to Process 2: Year-End Processing. The complete workflow includes:

1. **Close Current Year Balances** (Process 2, Step 1)
2. **Calculate Carry-Over** (Process 2, Step 2) - respects cycle boundaries
3. **Close Completed Cycles** (Process 2, Step 5) - Process 5, Scenario C
4. **Create New Balances** (Process 2, Step 6)
5. **Start New Cycles** (Process 2, Step 7) - Process 5, Scenario D

#### Cycle Management Rules Summary

- **Cycle Duration**: Always determined by `policy.cycleLengthYears` at cycle creation
- **One Active Cycle**: Only one ACTIVE cycle per employee per leave type at any time
- **Carry-Over Limit**: Applies within cycle, excess forfeited at cycle boundary
- **Cycle Boundaries**: Mark transition points where old cycle ends and new cycle begins
- **Policy Changes**: Existing cycles continue with original policy; new cycles use new policy

**Cycle Lifecycle Diagram:**

```
Cycle Creation (Process 0 or Employee Hire)
        ↓
    ACTIVE Status
        ↓
  (Years Progress)
        ↓
Year-End Processing
  (Track Carry-Over)
        ↓
  Cycle End Year?
        ├─ No → Continue ACTIVE
        └─ Yes → COMPLETED
                    ↓
              Start New Cycle
                    ↓
                (Repeat)
```

---

### Process 6: Leave Balance Management

This process covers all operations for creating, managing, querying, and maintaining employee leave balances. Leave balances are the core tracking mechanism that monitors earned days, used days, carried-over days, encashed days, and remaining available days for each employee per leave type per year.

#### Overview: How Leave Balance Management Works

Leave balances track an employee's leave entitlements and usage throughout a year. Key operations include:

- **Creating balances**: Bulk generation or individual creation for employees
- **Querying balances**: Finding balances by employee, year, or leave type
- **Closing balances**: Finalizing balances at year-end or for administrative purposes
- **Balance corrections**: Reopening and adjusting balances when needed
- **Balance integrity**: Ensuring balance values can only be modified through authorized processes

**Important Rule:**

```
Balance values (earned, used, remaining, encashed) can ONLY be modified through:
- Leave request approval/cancellation (updates 'used')
- Leave encashment approval (updates 'encashed')
- Year-end processing (updates 'earned' and 'carriedOver')
- Authorized adjustment transactions

Direct manual updates to balance values are PROHIBITED.
```

#### Scenario A: Generating Annual Leave Balances (Bulk Creation)

This scenario handles bulk generation of leave balances for all active employees at the start of a new year or during initial system setup.

**Trigger:** Part of Process 0 (Initial Setup) and Process 2 (Year-End Processing)

1. **Retrieve Active Policies and Employees**

   - Get all active leave policies from the system
   - Get all active employees
   - Validate that at least one policy and one employee exist

2. **Process Each Employee-Policy Combination**

   - For each active employee:
     - For each active leave policy:
       - Check if balance already exists for employee, leave type, and year
       - If exists and `forceRegenerate = false`: Skip (count as skipped)
       - If exists and `forceRegenerate = true`: Continue to create new balance

3. **Calculate Carry-Over from Previous Leave Year**

   - Get all cutoff configurations to find the previous leave year
   - Query previous leave year balance for same employee and leave type
   - If previous balance exists:
     - Get remaining days: `previousBalance.remaining`
     - Apply carry limit: `carriedOver = min(remaining, policy.carryLimit)`
     - Excess beyond limit is forfeited
   - If no previous balance: `carriedOver = 0`

   **Example:**

   ```
   Previous leave year ("2023-2024") balance:
   - remaining: 8 days
   - policy.carryLimit: 5 days
   - carriedOver for "2024-2025": min(8, 5) = 5 days
   - 3 days forfeited

   Note: Previous leave year is found by locating the cutoff configuration
   that comes before the current one, not by calendar year subtraction.
   ```

4. **Calculate Earned Days**

   - Set `earned = policy.annualEntitlement`
   - For mid-year hires: Pro-rate earned days based on hire date (handled separately)

5. **Create Balance Record**

   - Get or create cutoff configuration for the target leave year
   - Create new LeaveBalance with:
     - `employeeId`: Employee ID
     - `leaveTypeId`: Policy's leave type ID
     - `leaveType`: Policy's leave type name
     - `policyId`: Policy ID
     - `year`: Target leave year identifier (e.g., "2024-2025")
     - `beginningBalance`: earned + carriedOver
     - `earned`: policy.annualEntitlement
     - `used`: 0
     - `carriedOver`: Calculated carry-over
     - `encashed`: 0
     - `remaining`: earned + carriedOver
     - `status`: OPEN
     - `lastTransactionDate`: Current date
     - `remarks`: "Auto-generated annual leave balance for {year}"
     - `isActive`: true

6. **Return Generation Statistics**

   - Return: `{ generatedCount, skippedCount }`
   - Generated: New balances created
   - Skipped: Existing balances not regenerated

**Integration Points:**

- **Process 0**: Used during initial system setup to create balances for all employees
- **Process 2**: Used during year-end processing to generate next year's balances
- **Process 5**: Balance creation respects active cycle boundaries

**Example Output:**

```
Leave Year: "2024-2025"
Active Policies: 3 (VL, SL, PL)
Active Employees: 150

Result:
- generatedCount: 450 (150 employees × 3 policies)
- skippedCount: 0 (first time generation)
```

#### Scenario B: Creating Individual Leave Balance

This scenario handles creating a single leave balance for a specific employee, typically used for new hires, corrections, or mid-year additions.

1. **Validate Prerequisites**

   - Validate employee exists and is active
   - Validate leave type exists
   - Validate policy exists and is active
   - All validations must pass before proceeding

2. **Check for Duplicate Balance**

   - Query existing balance for: employee, leave type, and leave year identifier
   - If balance exists: Throw error (prevents duplicate balances)
   - If not exists: Continue with creation

3. **Calculate Carry-Over from Previous Leave Year**

   - Get all cutoff configurations to find the previous leave year
   - Query previous leave year balance for same employee and leave type
   - If previous balance exists:
     - Calculate: `carriedOver = min(previousBalance.remaining, policy.carryLimit)`
   - If no previous balance: `carriedOver = 0`

   **Note:** Previous leave year is determined by finding the cutoff configuration that comes before the current one, not by subtracting 1 from a calendar year.

4. **Calculate Earned Days**

   - **Normal case**: `earned = policy.annualEntitlement`
   - **Mid-year hire**: Pro-rate based on hire date:
     - Calculate months remaining in year from hire date
     - Formula: `earned = policy.annualEntitlement × (monthsRemaining / 12)`
     - Example: Hired July 1 (6 months): `earned = 15 × (6/12) = 7.5 days`

5. **Create Balance Record**

   - Create LeaveBalance with calculated values:
     - `beginningBalance`: earned + carriedOver
     - `earned`: Calculated earned days
     - `used`: 0
     - `carriedOver`: Calculated carry-over
     - `encashed`: 0
     - `remaining`: earned + carriedOver
     - `status`: OPEN
     - `lastTransactionDate`: Current date
     - `remarks`: "Created leave balance for employee {id}, leave type {type}, year {year}"
     - `isActive`: true

**Use Cases:**

- **New Employee Onboarding**: Create balances when employee joins mid-year
- **Balance Corrections**: Recreate balance after error or deletion
- **Policy Changes**: Create new balance when policy changes mid-year
- **Administrative Actions**: Manual balance creation for special cases

#### Scenario C: Closing Leave Balances

This scenario finalizes leave balances, typically at year-end or for administrative closure. Once closed, balances become read-only and cannot be modified except through reopening.

**Trigger:** Part of Process 2: Year-End Processing

1. **Validate Balance Exists and Status**

   - Query balance by ID
   - If not found: Throw NotFoundException
   - If already CLOSED: Throw BadRequestException (prevent duplicate closure)
   - If status is OPEN: Continue with closure

2. **Close the Balance**

   - Update LeaveBalance:
     - `status`: CLOSED (from OPEN)
     - `lastTransactionDate`: Current date
     - Optional: Update remarks with closure reason

3. **Balance Becomes Read-Only**

   - After closure, balance values cannot be modified
   - Balance can only be reopened if corrections needed (status: REOPENED)

**Integration:**

- **Process 2**: All OPEN balances for a year are closed during year-end processing
- **Process 6 Scenario F**: Closed balances may be reopened for corrections

**Status Transition:**

```
OPEN → CLOSED
```

#### Scenario D: Querying and Finding Balances

This scenario covers read-only operations to retrieve balances for validation, reporting, and display purposes.

**Operation 1: Find Balances by Employee and Leave Year**

- Purpose: Get all leave balances for a specific employee in a specific leave year
- Input: `employeeId`, `year` (leave year identifier string, e.g., "2023-2024")
- Output: Array of LeaveBalance records (all leave types)
- Use cases:
  - Employee dashboard display
  - Employee reporting
  - Year-end summaries

**Operation 2: Find Balance by Leave Type**

- Purpose: Get specific balance for employee, leave type, and leave year
- Input: `employeeId`, `leaveTypeId`, `year` (leave year identifier string)
- Output: Single LeaveBalance or null
- Use cases:
  - Leave request validation (check available balance)
  - Encashment validation (check remaining balance)
  - Specific leave type queries

**Important Notes:**

- These are **read-only operations** - no balance modifications
- Used extensively in:
  - **Leave Request Workflow**: Validate sufficient balance before approval
  - **Encashment Workflow**: Validate remaining balance and encash limits
  - **Reporting**: Generate balance reports and summaries
  - **Dashboards**: Display current balances to employees

#### Scenario E: Resetting Balances for Year

This scenario handles administrative cleanup by resetting all balances for a specific year. This is an irreversible operation used for data correction or system migration.

**Warning:** This is a destructive operation that clears all balances for a year. Use with extreme caution.

1. **Identify Target Year**

   - Specify year to reset
   - All balances for this year will be affected

2. **Reset All Balances**

   - Repository operation resets all balances for the specified year
   - Balances are cleared/reset (specific implementation depends on repository)

3. **Use Cases**

   - **Data Correction**: Reset before regenerating balances after error
   - **System Migration**: Clear balances before importing new data
   - **Year-End Cleanup**: Administrative cleanup (rare)

**Best Practice:**

```
Only use reset operation when absolutely necessary.
Consider backing up data before reset.
Reset is typically followed by balance regeneration.
```

#### Scenario F: Balance Corrections and Adjustments

This scenario handles fixing errors in leave balances by reopening closed balances and applying authorized adjustments.

1. **Identify Balance Needing Correction**

   - Locate incorrect balance (may be OPEN or CLOSED)
   - Document reason for correction

2. **Reopen Closed Balance (if needed)**

   - If balance status is CLOSED:
     - Update status: CLOSED → REOPENED
     - Balance can now be modified
   - If balance status is OPEN:
     - No status change needed

3. **Apply Corrections Through Authorized Processes**

   **Important:** Balance values can only be modified through authorized workflows:

   - Leave request approval/cancellation (updates `used`)
   - Encashment approval (updates `encashed`)
   - Adjustment transaction (updates any field via ADJUSTMENT transaction)
   - Year-end processing (updates `earned`, `carriedOver`)

   **Manual Updates Prohibited:**

   - Direct updates to balance values are NOT allowed
   - All changes must go through authorized processes

4. **Create Adjustment Transaction**

   - For any manual corrections:
     - Create LeaveTransaction with type: ADJUSTMENT
     - Record days affected (positive or negative)
     - Add remarks explaining the correction
     - Maintain audit trail

5. **Re-close or Finalize Balance**

   - After corrections:
     - If needed: Update status REOPENED → CLOSED
     - Optional: Update status to FINALIZED (permanent lock)

**Status Transitions:**

```
CLOSED → REOPENED → CLOSED → FINALIZED
OPEN → (corrections) → CLOSED → FINALIZED
```

**Example Correction:**

```
Balance Error: earned should be 15, currently shows 12
Action:
1. Reopen balance (if closed)
2. Create ADJUSTMENT transaction: +3 days to earned
3. Update remaining: +3 days
4. Re-close balance
5. Add remarks: "Correction: earned days adjusted from 12 to 15"
```

#### Integration with Other Processes

**Process 0: Initial Setup**

- Uses Scenario A (Generate Annual Balances) to create initial balances for all employees

**Process 1: Leave Request Workflow**

- Uses Scenario D (Query Balances) to validate sufficient balance before approval
- Balance `used` field updated when request approved

**Process 2: Year-End Processing**

- Uses Scenario C (Close Balances) to close all OPEN balances
- Uses Scenario A (Generate Annual Balances) to create next year's balances
- Calculates carry-over from closed balances

**Process 3: Leave Encashment**

- Uses Scenario D (Query Balances) to validate remaining balance and encash limits
- Balance `encashed` field updated when encashment approved

**Process 5: Leave Cycle Management**

- Balance creation respects active cycle boundaries
- Carry-over calculations consider cycle limits

#### Balance Management Rules Summary

- **Balance Creation**: Always calculates carry-over and earned days based on policy
- **Balance Closure**: Balances closed at year-end or for administrative purposes
- **Balance Updates**: Values can only be modified through authorized processes
- **Balance Queries**: Read-only operations for validation and reporting
- **Balance Integrity**: Formula must always be maintained: `remaining = (earned + carriedOver) - (used + encashed)`
- **Audit Trail**: All balance changes create LeaveTransaction records

---

## Business Rules

### 1. Leave Request Rules

- **Balance Validation**: Request days ≤ remaining balance

  - Formula: `totalDays ≤ balance.remaining`
  - Leave year determined by cutoff configuration for request start date
  - Validated at request submission (Scenario A) - uses cutoff-based year lookup
  - Re-validated at approval time (Scenario C) - balance may have changed
  - If insufficient balance: Request cannot be created or approved

- **Date Validation Rules**:

  - Start date must be >= today (cannot request past dates)
  - Start date must be <= end date
  - End date must be >= start date
  - Total days calculated:
    - If `isHalfDay = true` and `startDate === endDate`: `totalDays = 0.5`
    - Otherwise: `totalDays = (endDate - startDate + 1) - holidayCount` (calendar days minus holidays)
  - **Holiday Exclusion**: Holidays are automatically excluded from totalDays calculation
    - System fetches holidays in the date range and subtracts them from calendar days
    - Only active holidays (`isActive = true`) are excluded
    - Weekends are still counted (only holidays are excluded)
  - Fractional days are supported (0.5, 1.5, etc.) for half-day leaves

- **Half-Day Leave Rules**:

  - Half-day leaves require `isHalfDay = true` and `startDate === endDate`
  - Half-day leave calculates `totalDays = 0.5`
  - If `isHalfDay = true` but dates differ: Validation error thrown

- **Overlapping Request Rules**:

  - Employees cannot have overlapping leave periods
  - System validates against existing PENDING and APPROVED requests
  - CANCELLED and REJECTED requests do not block new requests
  - Date overlap formula: `newStartDate <= existingEndDate AND existingStartDate <= newEndDate`
  - Overlap validation occurs during request creation (Scenario A, Step 4)
  - Overlap validation also occurs during request update when dates are changed (Scenario F, Step 5)
  - The current request being updated is excluded from overlap check to allow updating its own dates

- **Request Update Rules**:

  - Only PENDING requests can be updated
  - Updates can change: leave type, dates, total days, reason
  - Balance is re-validated if dates/days or leave type changes
  - Leave type changes require finding and validating new balance
  - Overlapping validation is performed when dates are updated to prevent conflicts with existing requests
  - Current request being updated is excluded from overlap validation to allow date modifications

- **Balance Deduction Rules**:

  - Balance deduction occurs ONLY when request is APPROVED (Scenario C)
  - PENDING requests do NOT affect balance (Scenario A)
  - REJECTED requests do NOT affect balance (Scenario D)
  - CANCELLED PENDING requests have no balance impact (Scenario E1)
  - CANCELLED APPROVED requests restore balance (Scenario E2)

- **Approval Workflow Rules**:

  - All requests require manager approval (no auto-approval)
  - Requests start with status: PENDING
  - Manager can APPROVE or REJECT with remarks
  - Rejection remarks are REQUIRED

- **Status Transition Rules**:

  - PENDING → APPROVED: Manager approves (Scenario C)
  - PENDING → REJECTED: Manager rejects (Scenario D)
  - PENDING → CANCELLED: Employee cancels (Scenario E1)
  - APPROVED → CANCELLED: Employee cancels approved request (Scenario E2, if supported)
  - Terminal states: APPROVED, REJECTED, CANCELLED (cannot transition further)
  - Invalid transitions: APPROVED/REJECTED/CANCELLED → any other status

- **Balance Update Authorization**:

  - Leave request approval is an authorized process for updating balance `used` field
  - Balance `used` incremented by request.totalDays on approval
  - Balance `remaining` decremented by request.totalDays on approval
  - All approvals create REQUEST transaction for audit trail

- **Request Cancellation Rules**:
  - Employees can cancel their own PENDING requests
  - Employees can cancel their own APPROVED requests (restores balance)
  - Cancellation of APPROVED requests requires balance to be OPEN (cannot cancel if balance CLOSED)
  - Cancellation of PENDING requests has no balance impact
  - Cancellation of APPROVED requests creates reversal transaction

### 2. Balance Calculation Rules

- **Remaining Balance Formula**:

  ```
  remaining = (beginningBalance + earned + carriedOver) - (used + encashed)
  ```

  This formula must always be maintained. Any change to earned, used, carriedOver, or encashed must recalculate remaining.

- **Earned Days**: Set to policy.annualEntitlement at year start

  - For full-year employees: `earned = policy.annualEntitlement`
  - For mid-year hires: Pro-rated based on hire date
  - Pro-rating formula: `earned = policy.annualEntitlement × (monthsRemaining / 12)`
  - Example: Hired July 1 (6 months): `earned = 15 × (6/12) = 7.5 days`

- **Carry Over Rules**:

  - Only accrued from previous year's remaining balance
  - Limited by policy.carryLimit
  - Formula: `carriedOver = min(previousYear.remaining, policy.carryLimit)`
  - Excess beyond carry limit is forfeited at cycle boundary
  - Carry-over calculated during balance creation (Process 6: Scenario A or B)

- **Balance Creation Rules**:

  - New balances created with status: OPEN
  - Balance values initialized:
    - `earned`: From policy.annualEntitlement (or pro-rated)
    - `carriedOver`: Calculated from previous year (if exists)
    - `used`: 0 (initial)
    - `encashed`: 0 (initial)
    - `remaining`: earned + carriedOver
  - Duplicate balances prevented (one balance per employee/leaveType/year)

- **Balance Closure Rules**:

  - Balances closed at year-end or for administrative purposes
  - Status transition: OPEN → CLOSED
  - Closed balances become read-only
  - Can be reopened for corrections: CLOSED → REOPENED
  - Final state: FINALIZED (permanent lock, no changes allowed)

- **Balance Update Restrictions**:

  - Balance values can ONLY be modified through authorized processes:
    - Leave request approval/cancellation → updates `used`
    - Leave encashment approval → updates `encashed`
    - Year-end processing → updates `earned`, `carriedOver`
    - Adjustment transactions → updates any field (with ADJUSTMENT transaction)
  - Direct manual updates to balance values are PROHIBITED
  - Administrative operations allowed (do not modify balance values):
    - Creating new balances
    - Closing balances (status change)
    - Soft deleting balances (isActive change)
    - Resetting balances for year

- **Balance Query Rules**:
  - Read-only operations (no balance modifications)
  - Can query by employee and year (all leave types)
  - Can query by employee, leave type, and year (specific balance)
  - Used for validation, reporting, and display purposes

### 3. Encashment Rules

- **Availability**: Can only encash if balance.remaining > 0

- **Encashment Limit**: Total encashed days ≤ policy.encashLimit

  - Check: `(balance.encashed + requested) ≤ policy.encashLimit`

- **Encashment Deduction**: Deducts from remaining balance immediately

### 4. Policy Rules

- **One Active Policy**: Only one policy per leave type can be ACTIVE at a time

- **Date Overlap**: Policies can have overlapping date ranges but only one is active

- **Policy Applicability**:
  - New balances use the policy active on their start date
  - Existing balances keep their assigned policy

### 5. Cycle Management Rules

- **Cycle Duration**: Determined by policy.cycleLengthYears at cycle creation time

  - Once a cycle is created, its duration is fixed and does not change even if policy changes
  - Formula: `cycleEndYear = cycleStartYear + cycleLengthYears - 1`

- **One Active Cycle**: Only one ACTIVE cycle per employee per leave type at any time

  - When a new cycle starts, previous cycle must be COMPLETED
  - Cycles cannot overlap

- **Within Cycle Carry-Over**:

  - Carry-over rules apply year-to-year within the cycle
  - Formula: `carriedOver = min(previousYear.remaining, policy.carryLimit)`
  - `totalCarried` tracks cumulative carry-over within the cycle

- **Cycle Boundary Rules**:

  - At cycle end: Excess days beyond carry limit are forfeited
  - Only days within carry limit can transition to next cycle
  - New cycles start with `totalCarried = 0` (unless carrying from previous cycle)

- **Cycle Creation Rules**:

  - New cycles created on employee hire, system setup, or after cycle completion
  - Cycle start year typically based on: hire date, policy effective date, or current year
  - Each cycle is tied to a specific policy (the one active at cycle creation)

- **Policy Change Impact**:
  - Existing cycles continue with original cycle length (recommended approach)
  - New cycles created after policy change use new cycle length
  - Policy changes should not disrupt active cycles mid-execution

### 6. Leave Year Configuration Rules

- **Cutoff Period Definition**: Each configuration defines a leave year period with flexible start and end dates

  - Example: Nov 26, 2023 to Nov 25, 2024
  - Next period can have different dates: Nov 26, 2024 to Nov 5, 2025
  - Cutoff dates can change frequently without affecting existing balances

- **Leave Year Identifier**: Automatically generated from cutoff dates

  - Format: "YYYY-YYYY" (e.g., "2023-2024")
  - First year from cutoffStartDate, second year from cutoffEndDate
  - Used as the `year` field in LeaveBalance entities

- **Date-Based Lookup**: System finds active configuration for any date

  - `findActiveForDate(date)` returns configuration covering that date
  - Only one active configuration can cover a specific date
  - Used to determine which leave year a date falls into

- **Historical Preservation**: Old configurations remain when new ones are created

  - Existing balances remain tied to their original cutoff configuration
  - New balances use the active configuration for their creation date
  - Enables tracking of historical leave year definitions

- **Configuration Management**:

  - Create new configuration when cutoff dates change
  - Update existing configuration (regenerates year identifier if dates change)
  - Deactivate old configurations (soft delete)
  - All configurations are global (apply to all leave types)

### 7. Audit and Compliance

- **Transaction Log**: All balance changes must create a LeaveTransaction

  - Updates to: earned, used, carriedOver, encashed

- **Balance Status**:

  - OPEN: Active and modifiable
  - CLOSED: Year-ended, read-only
  - FINALIZED: Permanently locked

- **Soft Delete**: All entities use isActive flag instead of hard deletion

---

## Entity Relationships

```
LeaveType (1) ────< (M) LeavePolicy
   │                       │
   │                       │
   │                   (1) │
   │                       │
   │                       ▼
   │                LeaveBalance
   │                       │
   │                       │
   │                   (M) │
   │                       ▼
   │              LeaveTransaction
   │                       │
   │                       │
   │                   (1) │
   │                       │
   │                       │
   │                   (1) │
   │                       │
   │                       ▼
   │                LeaveRequest
   │                       │
   │                       │
   │                   (1) │
   │                       │
   │                       ▼
   │            LeaveEncashment
   │                       │
   │                       │
   │                       │
   │                   (M) │
   │                       ▼
   │                 Employee
   │
LeaveYearConfiguration (Global)
   │
   │ (Used by all balances to determine leave year)
   │
   └───> LeaveBalance.year (string identifier)
```

### Relationship Details

1. **LeaveType → LeavePolicy** (1:M)

   - One leave type can have multiple policies (different date ranges)
   - Policy must reference an existing LeaveType

2. **LeaveType → LeaveBalance** (1:M)

   - One leave type can have multiple balances (different employees, leave years)
   - Balance references a specific LeaveType

3. **LeavePolicy → LeaveBalance** (1:M)

   - One policy can have multiple balances
   - Balance references a specific policy that was active when it was created

4. **LeaveYearConfiguration → LeaveBalance** (Indirect)

   - LeaveYearConfiguration defines cutoff periods globally
   - LeaveBalance.year field stores leave year identifier (e.g., "2023-2024")
   - System uses cutoff configuration to determine which leave year a date falls into
   - Multiple balances can reference the same leave year identifier

5. **LeaveBalance → LeaveTransaction** (1:M)

   - One balance has many transaction records
   - Every balance change creates a transaction

6. **LeaveBalance → LeaveRequest** (1:M)

   - One balance can have multiple requests
   - Request references the balance it uses
   - Request creation uses cutoff configuration to find correct balance

7. **LeaveBalance → LeaveEncashment** (1:M)

   - One balance can have multiple encashments
   - Encashment references the balance it uses

8. **Employee → All Entities** (1:M)
   - Employee has multiple balances, requests, encashments
   - All entities reference employeeId

---

## Status Lifecycles

### LeavePolicy Status Lifecycle

```
DRAFT → ACTIVE → INACTIVE → RETIRED
  ↓         ↓         ↓
  └─────────┴─────────┘
    (can reactivate)
```

**Transitions:**

- DRAFT → ACTIVE: Policy activated
- ACTIVE → INACTIVE: Temporarily suspended
- INACTIVE → ACTIVE: Reactivated
- ACTIVE/INACTIVE → RETIRED: Policy discontinued
- RETIRED: Final state, cannot be reactivated

### LeaveRequest Status Lifecycle

```
PENDING → APPROVED
    ↓         │
    └────→ REJECTED
    ↓
CANCELLED
```

**Transitions:**

- PENDING → APPROVED: Manager approves
- PENDING → REJECTED: Manager rejects
- PENDING → CANCELLED: Employee cancels
- Other states: Terminal states

### LeaveBalance Status Lifecycle

```
OPEN → CLOSED → REOPENED → FINALIZED
```

**Transitions:**

- OPEN → CLOSED: Year-end closure
- CLOSED → REOPENED: Correction needed
- REOPENED → CLOSED: Re-closed after correction
- CLOSED/REOPENED → FINALIZED: Finalized, no changes allowed
- FINALIZED: Terminal state

### LeaveEncashment Status Lifecycle

```
PENDING → PAID
    ↓         │
    └────→ CANCELLED
```

**Transitions:**

- PENDING → PAID: Encashment processed and paid
- PENDING → CANCELLED: Encashment cancelled
- PAID/CANCELLED: Terminal states

### LeaveCycle Status Lifecycle

```
ACTIVE → COMPLETED
```

**Transitions:**

- ACTIVE → COMPLETED: Cycle ends
- COMPLETED: Terminal state

---

## Common Use Cases

### Use Case 1: Employee Requests Leave

**Actor:** Employee, Manager  
**Goal:** Request and get approval for time off

**Steps:**

1. **Employee Submits Request** (Process 1: Scenario A):

   - Employee selects leave type, start date, end date, reason, and optionally half-day flag
   - System validates dates (start >= today, start <= end)
   - System calculates total days (supports half-day: 0.5 days when isHalfDay = true and same start/end date)
   - System validates no overlapping requests exist (checks PENDING/APPROVED requests only)
   - System validates sufficient balance exists
   - If valid, creates LeaveRequest with status PENDING
   - Balance remains unchanged (deduction happens on approval)

2. **Employee Updates Request** (Process 1: Scenario F - Optional):

   - Employee can update PENDING request (dates, leave type, days, reason)
   - System re-validates balance if dates/days or leave type changed
   - System validates dates and half-day rules if dates changed
   - System validates no overlapping requests exist when dates are updated (excludes current request from check)
   - Request remains PENDING after update

3. **Manager Reviews Request** (Process 1: Scenario B):

   - Manager views pending requests
   - Reviews request details and employee balance
   - Decides to approve or reject

4. **Manager Approves Request** (Process 1: Scenario C):
   - Manager approves with optional remarks
   - System re-validates balance (may have changed)
   - Request status updated to APPROVED
   - Balance updated: `used` incremented, `remaining` decremented
   - Transaction created for audit trail
   - Employee notified of approval

**Alternative Path - Manager Rejects** (Process 1: Scenario D):

- Manager rejects with required remarks
- Request status updated to REJECTED
- Balance remains unchanged
- Employee notified of rejection

**Alternative Path - Employee Cancels** (Process 1: Scenario E):

- Employee cancels PENDING request → No balance impact
- Employee cancels APPROVED request → Balance restored (if balance is OPEN)

**Success:** Request approved, balance updated, transaction logged, employee notified

**Related Process:** See Process 1: Leave Request Workflow for detailed scenarios (A-G)

---

### Use Case 2: Year-End Processing

**Actor:** System Administrator  
**Goal:** Close current year, initialize new year balances

**Steps:**

1. Get active cutoff configuration to determine ending leave year
2. Close all OPEN balances for the ending leave year
3. Get or create new cutoff configuration for next leave year period
4. Calculate carry-over for each employee/leave type (from previous leave year)
5. Create new balances for all active employees with new leave year identifier
6. Set earned = annual entitlement
7. Carry over days within policy limit

**Success:** All employees have new leave year balances with proper carry-over

---

### Use Case 3: Employee Enashes Leave

**Actor:** Employee, Payroll  
**Goal:** Convert unused leave to cash

**Steps:**

1. Employee requests encashment
2. System validates balance and encashment limit
3. Creates PENDING encashment
4. Deducts days from balance
5. Creates transaction (type: ENCASHMENT)
6. Process payment through payroll
7. Mark as PAID

**Success:** Days encashed, balance updated, payment processed

---

### Use Case 4: Policy Update

**Actor:** HR Administrator  
**Goal:** Update leave entitlements for future periods

**Steps:**

1. Create new policy in DRAFT status
2. Configure entitlements, limits, dates
3. Activate new policy (retires old one)
4. Existing balances keep old policy
5. New balances use new policy

**Success:** Future balances use updated entitlements

---

### Use Case 5: Balance Correction

**Actor:** System Administrator  
**Goal:** Fix errors in leave balances

**Steps:**

1. Locate incorrect balance (may be CLOSED)
2. If CLOSED, reopen (status: REOPENED)
3. Make correction (add/remove days)
4. Create ADJUSTMENT transaction with remarks
5. Re-close balance (status: CLOSED)
6. Finalize if needed (status: FINALIZED)

**Success:** Balance corrected with audit trail

---

### Use Case 6: View Leave History

**Actor:** Employee, Manager  
**Goal:** Review past leave usage

**Steps:**

1. Query LeaveRequest by employee
2. Query LeaveBalance by employee and leave year identifier (e.g., "2023-2024")
3. Query LeaveTransaction by balance
4. Display chronological history

**Success:** Complete audit trail of all leave activity

---

### Use Case 7: Manage Leave Cycles

**Actor:** System Administrator, HR Administrator  
**Goal:** Create and manage leave cycles for employees

**Steps:**

1. Identify employees needing cycles (new hires or system setup)
2. For each employee and leave type:
   - Get active policy to determine cycle length
   - Calculate cycle start and end years
   - Create LeaveCycle with status ACTIVE
3. During year-end processing:
   - Identify cycles ending in current year
   - Calculate final carry-over and forfeited days
   - Close cycles (status: COMPLETED)
   - Start new cycles for next period
4. Handle policy changes:
   - Allow existing cycles to complete
   - Create new cycles with new policy settings

**Success:** All employees have active cycles, cycles properly transition at boundaries

**Related Process:** See Process 5: Leave Cycle Management for detailed scenarios

---

### Use Case 8: Balance Management Operations

**Actor:** System Administrator, HR Administrator  
**Goal:** Create, query, close, and maintain leave balances for employees

**Steps:**

1. **Generate Annual Balances** (Scenario A):

   - Run bulk generation for all active employees
   - System calculates carry-over from previous leave year
   - Creates balances for all employee-policy combinations with leave year identifier
   - Returns generation statistics (generated/skipped counts)

2. **Create Individual Balance** (Scenario B):

   - For new employee or correction:
     - Validate employee, leave type, and policy
     - Calculate carry-over and earned days
     - Create balance with OPEN status

3. **Query Balances** (Scenario D):

   - Find balances by employee and leave year identifier (all leave types)
   - Find specific balance by leave type and leave year identifier
   - Used for validation, reporting, dashboards

4. **Close Balances** (Scenario C):

   - At leave year-end or administrative closure:
     - Close all OPEN balances for a leave year identifier
     - Balances become read-only after closure

5. **Balance Corrections** (Scenario F):

   - If errors found:
     - Reopen closed balance (status: REOPENED)
     - Apply corrections through authorized processes
     - Create ADJUSTMENT transactions for audit
     - Re-close or finalize balance

6. **Reset Balances** (Scenario E - Rare):
   - Administrative cleanup:
     - Reset all balances for a year (irreversible)
     - Used before regeneration or migration

**Success:** All employees have proper balances, balances accurately tracked, corrections applied correctly

**Related Process:** See Process 6: Leave Balance Management for detailed scenarios

---

## Key Domain Principles

### 1. Balance Accuracy

- All balance changes must create a transaction record
- Balance formula must always be maintained: `remaining = (earned + carriedOver) - (used + encashed)`
- Year-end processing must preserve data integrity
- Balance values can only be modified through authorized processes
- Balance integrity maintained through strict update controls

### 2. Policy Enforceability

- Only ACTIVE policies can be assigned to new balances
- Policy limits (carry, encash) are strictly enforced
- Date ranges determine policy applicability

### 3. Audit Trail

- All changes tracked via LeaveTransaction
- Status changes are logged
- Soft delete preserves historical data

### 4. Workflow Controls

- Requests require approval workflow
- Encashment requires payment workflow
- Status transitions follow defined rules

### 5. Multi-Year Cycles

- Policies define cycle lengths
- Carry-over rules respect cycle boundaries
- Cycle completion triggers carry-over calculations

### 6. Balance Management Integrity

- **Authorized Updates Only**: Balance values can only be modified through:
  - Leave request approval/cancellation
  - Leave encashment approval
  - Year-end processing operations
  - Authorized adjustment transactions
- **Prohibited Operations**: Direct manual updates to balance values are not allowed
- **Balance Creation Rules**: All balances created with proper calculations for earned, carriedOver, and remaining
- **Balance Closure**: Balances closed at year-end become read-only, ensuring historical accuracy
- **Balance Corrections**: Corrections require reopening, authorized adjustment, and audit trail via transactions
- **Query Operations**: Balance queries are read-only, supporting validation and reporting without modification

---

## Domain Implementation Notes

### Repository Pattern

All entities use repository interfaces to abstract data access:

- `ILeaveTypeRepository`, `ILeavePolicyRepository`, etc.
- Each repository defines CRUD and query operations
- Context parameter enables transaction management

### Domain Models

- Entities are plain TypeScript classes
- No infrastructure dependencies
- Constructor-based initialization with DTOs
- Immutable core, updates create new instances

### Status Enums

- All status values defined as enums
- Type-safe status handling
- Clear state machine definitions

### Business Logic Distribution

- Domain models contain business data
- Repository interfaces define operations
- Use cases (in application layer) orchestrate workflows
- Infrastructure layer implements repositories

---

## Conclusion

The Leave Management domain provides a comprehensive solution for managing employee leave entitlements, balancing flexibility with policy compliance. The domain follows clean architecture principles with clear separation of concerns, enabling robust and maintainable leave management functionality.
