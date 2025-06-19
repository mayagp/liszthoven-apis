enum PurchasePaymentStatus {
  DRAFT = 0,
  APPROVED = 1,
  CANCELLED = 2,
}

export const getPurchasePaymentStatusEnumLabel = (
  purchasePaymentStatus: PurchasePaymentStatus,
) => {
  switch (purchasePaymentStatus) {
    case PurchasePaymentStatus.DRAFT:
      return 'Draft';
    case PurchasePaymentStatus.APPROVED:
      return 'Approved';
    case PurchasePaymentStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchasePaymentStatusOption = {
  id: PurchasePaymentStatus;
  name: string;
};

export const getPurchasePaymentStatusEnums = () => {
  const enums = Object.entries(PurchasePaymentStatus);
  const result: PurchasePaymentStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchasePaymentStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchasePaymentStatus;
