export class UpdateSupplierQuotationDto {
  quotation_no: string;
  supplier_id: number;
  date: Date;
  expected_delivery_date: Date;
  tax: number;
  note: string;
}
