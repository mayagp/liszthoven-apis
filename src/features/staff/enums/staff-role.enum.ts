enum StaffRoleEnum {
  DEVELOPER = 0,
  ADMIN = 2,
  OWNER = 3,
  ADMIN_MANAGER = 4,
  COMMISSIONER = 5,
  DIRECTOR = 6,
  ACCOUNTANT = 7,
  CLEANING_SERVICE = 8,
  OPERATION_MANAGER = 9,
  BRANCH_ADMIN = 10,
  MARKETING_MANAGER = 11,
  ACCOUNTING = 12,
}

export const getStaffRoleEnumLabel = (role: StaffRoleEnum) => {
  switch (role) {
    case StaffRoleEnum.DEVELOPER:
      return 'Developer';
    case StaffRoleEnum.ADMIN:
      return 'Admin';
    case StaffRoleEnum.OWNER:
      return 'Owner';
    case StaffRoleEnum.ADMIN_MANAGER:
      return 'Admin Manager';
    case StaffRoleEnum.COMMISSIONER:
      return 'Commissioner';
    case StaffRoleEnum.DIRECTOR:
      return 'Director';
    case StaffRoleEnum.ACCOUNTANT:
      return 'Accountant';
    case StaffRoleEnum.CLEANING_SERVICE:
      return 'Cleaning Service';
    case StaffRoleEnum.OPERATION_MANAGER:
      return 'Operation Manager';
    case StaffRoleEnum.BRANCH_ADMIN:
      return 'Branch Admin';
    case StaffRoleEnum.MARKETING_MANAGER:
      return 'Marketing Manager';
    case StaffRoleEnum.ACCOUNTING:
      return 'Accounting';
    default:
      return 'Unknown';
  }
};

export const getRoleTypeEnums = () => {
  const enums = Object.entries(StaffRoleEnum);
  const result: { id: StaffRoleEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getStaffRoleEnumLabel(+value),
      });
    }
  }

  return result;
};

export default StaffRoleEnum;
