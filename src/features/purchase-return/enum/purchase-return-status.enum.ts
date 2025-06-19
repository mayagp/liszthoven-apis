enum PurchaseReturnStatus {
  DRAFT = 0,
  COMPLETE = 1,
  CANCELLED = 2,
}

export const getPurchaseReturnStatusEnumLabel = (
  purchaseReturnStatus: PurchaseReturnStatus,
) => {
  switch (purchaseReturnStatus) {
    case PurchaseReturnStatus.DRAFT:
      return 'Draft';
    case PurchaseReturnStatus.COMPLETE:
      return 'Complete';
    case PurchaseReturnStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchaseReturnStatusOption = {
  id: PurchaseReturnStatus;
  name: string;
};

export const getPurchaseReturnStatusEnums = () => {
  const enums = Object.entries(PurchaseReturnStatus);
  const result: PurchaseReturnStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseReturnStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseReturnStatus;
