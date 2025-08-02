enum PurchasePlanStatus {
  CREATED = 0,
  PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export const getPurchasePlanStatusEnumLabel = (
  supplierQuotationStatus: PurchasePlanStatus,
) => {
  switch (supplierQuotationStatus) {
    case PurchasePlanStatus.CREATED:
      return 'Created';
    case PurchasePlanStatus.PROGRESS:
      return 'Progress';
    case PurchasePlanStatus.COMPLETED:
      return 'Completed';
    case PurchasePlanStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

export const getPurchasePlanStatusEnums = (): {
  id: PurchasePlanStatus;
  name: string;
}[] => {
  const enums = Object.entries(PurchasePlanStatus);
  const result: { id: PurchasePlanStatus; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchasePlanStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchasePlanStatus;
