enum InventoryHistoryTypeEnum {
  INCREASE = 0,
  DECREASE = 1,
}

export const getInventoryHistoryTypeEnumLabel = (
  inventoryHistoryType: InventoryHistoryTypeEnum,
) => {
  switch (inventoryHistoryType) {
    case InventoryHistoryTypeEnum.INCREASE:
      return 'Increase';
    case InventoryHistoryTypeEnum.DECREASE:
      return 'Descrease';
    default:
      return 'Unknown';
  }
};

export const getInventoryHistoryTypeEnums = () => {
  const enums = Object.entries(InventoryHistoryTypeEnum);
  const result: { id: InventoryHistoryTypeEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getInventoryHistoryTypeEnumLabel(+value),
      });
    }
  }

  return result;
};

export default InventoryHistoryTypeEnum;
