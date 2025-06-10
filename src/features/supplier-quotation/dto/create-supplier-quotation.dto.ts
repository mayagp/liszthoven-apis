import { CreateSupplierQuotationDetailDto } from 'src/features/supplier-quotation-detail/dto/create-supplier-quotation-detail.dto';
import { UpdateSupplierQuotationDto } from './update-supplier-quotation.dto';

export class CreateSupplierQuotationDto extends UpdateSupplierQuotationDto {
  supplier_quotation_details: Array<CreateSupplierQuotationDetailDto>;
}
