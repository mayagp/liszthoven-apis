enum PurchaseReturnDestination {
  GOODS_RECEIPT = 0,
  INVOICE = 1,
}

export const getPurchaseReturnDestinationEnumLabel = (
  purchaseDestinationType: PurchaseReturnDestination,
) => {
  switch (purchaseDestinationType) {
    case PurchaseReturnDestination.GOODS_RECEIPT:
      return 'Goods receipt';
    case PurchaseReturnDestination.INVOICE:
      return 'Invoice';
    default:
      return 'Unknown';
  }
};

type PurchaseReturnDestinationOption = {
  id: PurchaseReturnDestination;
  name: string;
};
export const getPurchaseReturnDestinationEnums = () => {
  const enums = Object.entries(PurchaseReturnDestination);
  const result: PurchaseReturnDestinationOption[] = [];
  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseReturnDestinationEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseReturnDestination;
