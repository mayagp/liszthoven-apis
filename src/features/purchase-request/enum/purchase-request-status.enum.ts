enum PurchaseRequestStatus {
  PENDING = 0,
  APPROVAL_REQUEST = 1,
  APPROVED = 2,
  CANCELLED = 3,
}

export const getPurchaseRequestStatusEnumLabel = (
  purchaseRequestStatus: PurchaseRequestStatus,
) => {
  switch (purchaseRequestStatus) {
    case PurchaseRequestStatus.PENDING:
      return 'Pending';
    case PurchaseRequestStatus.APPROVAL_REQUEST:
      return 'Approval request';
    case PurchaseRequestStatus.APPROVED:
      return 'Approved';
    case PurchaseRequestStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

type PurchaseRequestStatusOption = {
  id: PurchaseRequestStatus;
  name: string;
};

export const getPurchaseRequestStatusEnums = () => {
  const enums = Object.entries(PurchaseRequestStatus);
  const result: PurchaseRequestStatusOption[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getPurchaseRequestStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default PurchaseRequestStatus;
