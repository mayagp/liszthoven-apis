enum PurchaseRequestStatus {
  NEED_APPROVAL = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export const getPurchaseRequestStatusEnumLabel = (
  purchaseRequestStatus: PurchaseRequestStatus,
) => {
  switch (purchaseRequestStatus) {
    case PurchaseRequestStatus.NEED_APPROVAL:
      return 'Need Approval';
    case PurchaseRequestStatus.APPROVED:
      return 'Approved';
    case PurchaseRequestStatus.REJECTED:
      return 'Rejected';
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
