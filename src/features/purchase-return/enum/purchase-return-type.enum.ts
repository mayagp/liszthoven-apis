enum PurchaseReturnType {
  RETURN = 0,
  REFUND = 1,
}

export const getPurchaseReturnTypeEnumLabel = (
  purchaseReturnType: PurchaseReturnType,
) => {
  switch (purchaseReturnType) {
    case PurchaseReturnType.RETURN:
      return 'Return';
    case PurchaseReturnType.REFUND:
      return 'Refund';
    default:
      return 'Unknown';
  }
};

type PurchaseReturnTypeOption = {
  id: PurchaseReturnType;
  name: string;
};

export const getPurchaseReturnTypeEnums = () => {
  const enums = Object.entries(PurchaseReturnType);
  const result: PurchaseReturnTypeOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseReturnTypeEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseReturnType;
