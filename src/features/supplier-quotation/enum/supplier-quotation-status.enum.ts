enum SupplierQuotationStatus {
  PENDING = 0,
  RECEIVED = 1,
  CANCELLED = 2,
}

export const getSupplierQuotationStatusEnumLabel = (
  supplierQuotationStatus: SupplierQuotationStatus,
) => {
  switch (supplierQuotationStatus) {
    case SupplierQuotationStatus.PENDING:
      return 'Pending';
    case SupplierQuotationStatus.RECEIVED:
      return 'Approved';
    case SupplierQuotationStatus.CANCELLED:
      return 'Cancelled';
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
