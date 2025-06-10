enum ValuationMethodEnum {
  LIFO = 0,
  FIFO = 1,
  AVG = 2,
}

export const getValuationMethodEnumLabel = (
  valuationMethod: ValuationMethodEnum,
) => {
  switch (valuationMethod) {
    case ValuationMethodEnum.LIFO:
      return 'LIFO';
    case ValuationMethodEnum.FIFO:
      return 'FIFO';
    case ValuationMethodEnum.AVG:
      return 'AVERAGE';
    default:
      return 'Unknown';
  }
};

export const getValuationMethodEnums = () => {
  const enums = Object.entries(ValuationMethodEnum);
  const result: { id: ValuationMethodEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value as ValuationMethodEnum,
        name: getValuationMethodEnumLabel(+value),
      });
    }
  }

  return result;
};

export default ValuationMethodEnum;
