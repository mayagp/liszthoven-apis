import { CreatePurchaseInvoiceDetailDto } from 'src/features/purchase-invoice-detail/dto/create-purchase-invoice-detail.dto';
import { UpdatePurchaseInvoiceDto } from './update-purchase-invoice.dto';

export class CreatePurchaseInvoiceDto extends UpdatePurchaseInvoiceDto {
  purchase_invoice_details: Array<CreatePurchaseInvoiceDetailDto>;
}
