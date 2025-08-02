enum SupplierQuotationStatus {
  REQUESTED = 0,
  OFFERED = 1,
  RECEIVED = 2,
  REJECTED = 3,
}

export const getSupplierQuotationStatusEnumLabel = (
  supplierQuotationStatus: SupplierQuotationStatus,
) => {
  switch (supplierQuotationStatus) {
    case SupplierQuotationStatus.REQUESTED:
      return 'Requested';
    case SupplierQuotationStatus.OFFERED:
      return 'Offered';
    case SupplierQuotationStatus.RECEIVED:
      return 'Received';
    case SupplierQuotationStatus.REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

type SupplierQuotationStatusEnumItem = {
  id: SupplierQuotationStatus;
  name: string;
};

export const getSupplierQuotationStatusEnums = () => {
  const enums = Object.entries(SupplierQuotationStatus);
  const result: SupplierQuotationStatusEnumItem[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getSupplierQuotationStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default SupplierQuotationStatus;
