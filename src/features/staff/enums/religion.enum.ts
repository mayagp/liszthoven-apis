enum ReligionEnum {
  ISLAM = 0,
  CHRISTIANITY = 1,
  CATHOLIC = 2,
  HINDUISM = 3,
  BUDDHISM = 4,
  CONFUCIANISM = 5,
  OTHER = 6,
}

export const getReligionEnumLabel = (religion: ReligionEnum) => {
  switch (religion) {
    case ReligionEnum.ISLAM:
      return 'Islam';
    case ReligionEnum.CHRISTIANITY:
      return 'Christianity';
    case ReligionEnum.CATHOLIC:
      return 'Catholic';
    case ReligionEnum.HINDUISM:
      return 'Hinduism';
    case ReligionEnum.BUDDHISM:
      return 'Buddhism';
    case ReligionEnum.CONFUCIANISM:
      return 'Confucianism';
    case ReligionEnum.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
};

export const getReligionEnums = () => {
  const enums = Object.entries(ReligionEnum);
  const result: { id: ReligionEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getReligionEnumLabel(+value),
      });
    }
  }

  return result;
};

export default ReligionEnum;
