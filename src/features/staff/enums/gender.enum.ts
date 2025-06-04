enum GenderEnum {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

export const getGenderEnumLabel = (gender: GenderEnum) => {
  switch (gender) {
    case GenderEnum.MALE:
      return 'Male';
    case GenderEnum.FEMALE:
      return 'Female';
    case GenderEnum.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
};

export const getGenderEnums = () => {
  const enums = Object.entries(GenderEnum);
  const result: { id: GenderEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getGenderEnumLabel(+value),
      });
    }
  }

  return result;
};

export default GenderEnum;
