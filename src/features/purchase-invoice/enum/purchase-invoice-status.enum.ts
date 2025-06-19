enum PurchaseInvoiceStatus {
  PENDING = 0,
  PAYMENT_APPROVAL = 1,
  APPROVED = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export const getPurchaseInvoiceStatusEnumLabel = (
  purchaseInvoiceStatus: PurchaseInvoiceStatus,
) => {
  switch (purchaseInvoiceStatus) {
    case PurchaseInvoiceStatus.PENDING:
      return 'Pending';
    case PurchaseInvoiceStatus.PAYMENT_APPROVAL:
      return 'Payment approval';
    case PurchaseInvoiceStatus.APPROVED:
      return 'Approved';
    case PurchaseInvoiceStatus.COMPLETED:
      return 'Completed';
    case PurchaseInvoiceStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchaseInvoiceStatusOption = {
  id: PurchaseInvoiceStatus;
  name: string;
};

export const getPurchaseInvoiceStatusEnums = () => {
  const enums = Object.entries(PurchaseInvoiceStatus);
  const result: PurchaseInvoiceStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseInvoiceStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseInvoiceStatus;
