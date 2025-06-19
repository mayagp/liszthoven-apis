enum UserRoleEnum {
  DEVELOPER = 0,
  BRANCH_ADMIN = 2,
  ADMIN_MANAGER = 3,
  OWNER = 4,
  SUPPLIER = 7,
}

export const getUserRoleEnumLabel = (role: UserRoleEnum) => {
  switch (role) {
    case UserRoleEnum.DEVELOPER:
      return 'Developer';
    case UserRoleEnum.BRANCH_ADMIN:
      return 'Branch Admin';
    case UserRoleEnum.ADMIN_MANAGER:
      return 'Admin Manager';
    case UserRoleEnum.OWNER:
      return 'Owner';
    case UserRoleEnum.SUPPLIER:
      return 'Supplier';
    default:
      return 'Unknown';
  }
};

export const getRoleTypeEnums = () => {
  const enums = Object.entries(UserRoleEnum);
  const result: { id: UserRoleEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getUserRoleEnumLabel(+value),
      });
    }
  }

  return result;
};

export default UserRoleEnum;
