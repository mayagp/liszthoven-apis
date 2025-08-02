import { UpdateSupplierQuotationDetailDto } from 'src/features/supplier-quotation-detail/dto/update-supplier-quotation-detail.dto';

export class UpdateSupplierQuotationDto {
  quotation_no: string;
  supplier_id: number;
  date: Date;
  expected_delivery_date: Date;
  tax: number;
  note: string;
  supplier_quotation_details?: UpdateSupplierQuotationDetailDto[];
}
