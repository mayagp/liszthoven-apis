enum PurchaseOrderDetailStatus {
  CREATED = 0,
  ON_DELIVERY = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export const getPurchaseOrderDetailStatusEnumLabel = (
  purchaseOrderDetailStatus: PurchaseOrderDetailStatus,
) => {
  switch (purchaseOrderDetailStatus) {
    case PurchaseOrderDetailStatus.CREATED:
      return 'Created';
    case PurchaseOrderDetailStatus.ON_DELIVERY:
      return 'On delivery';
    case PurchaseOrderDetailStatus.COMPLETED:
      return 'Completed';
    case PurchaseOrderDetailStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchaseOrderDetailStatusOption = {
  id: PurchaseOrderDetailStatus;
  name: string;
};

export const getPurchaseOrderDetailStatusEnums = () => {
  const enums = Object.entries(PurchaseOrderDetailStatus);
  const result: PurchaseOrderDetailStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseOrderDetailStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseOrderDetailStatus;
