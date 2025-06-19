enum PurchaseOrderStatus {
  PENDING = 0,
  APPROVED = 1,
  ON_DELIVERY = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export const getPurchaseOrderStatusEnumLabel = (
  purchaseOrderStatus: PurchaseOrderStatus,
) => {
  switch (purchaseOrderStatus) {
    case PurchaseOrderStatus.PENDING:
      return 'Pending';
    case PurchaseOrderStatus.APPROVED:
      return 'Approved';
    case PurchaseOrderStatus.ON_DELIVERY:
      return 'On delivery';
    case PurchaseOrderStatus.COMPLETED:
      return 'Completed';
    case PurchaseOrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchaseOrderStatusOption = {
  id: PurchaseOrderStatus;
  name: string;
};

export const getPurchaseOrderStatusEnums = () => {
  const enums = Object.entries(PurchaseOrderStatus);
  const result: PurchaseOrderStatusOption[] = [];
  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseOrderStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseOrderStatus;
