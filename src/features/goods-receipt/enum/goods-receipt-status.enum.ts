enum GoodsReceiptStatusEnum {
  DRAFT = 0,
  COMPLETED = 1,
  CANCELLED = 2,
}

export const getGoodsReceiptEnumLabel = (
  goodsReceiptStatus: GoodsReceiptStatusEnum,
) => {
  switch (goodsReceiptStatus) {
    case GoodsReceiptStatusEnum.DRAFT:
      return 'Draft';
    case GoodsReceiptStatusEnum.COMPLETED:
      return 'Completed';
    case GoodsReceiptStatusEnum.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type GoodReceiptStatusOption = {
  id: GoodsReceiptStatusEnum;
  name: string;
};

export const getGoodsReceiptStatusEnums = () => {
  const enums = Object.entries(GoodsReceiptStatusEnum);
  const result: GoodReceiptStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getGoodsReceiptEnumLabel(+value),
      });
    }
  }

  return result;
};

export default GoodsReceiptStatusEnum;
