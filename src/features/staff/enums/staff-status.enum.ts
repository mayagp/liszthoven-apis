enum StaffStatusEnum {
  ACTIVE = 0,
  RESIGN = 1,
}

export const getStaffStatusEnumLabel = (status: StaffStatusEnum) => {
  switch (status) {
    case StaffStatusEnum.ACTIVE:
      return 'Active';
    case StaffStatusEnum.RESIGN:
      return 'Resign';

    default:
      return 'Unknown';
  }
};

export const getStaffStatusEnums = () => {
  const enums = Object.entries(StaffStatusEnum);
  const result: { id: StaffStatusEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getStaffStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default StaffStatusEnum;
