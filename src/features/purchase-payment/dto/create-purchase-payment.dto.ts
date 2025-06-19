import { CreatePurchasePaymentAllocationDto } from 'src/features/purchase-payment-allocation/dto/create-purchase-payment-allocation.dto';
import { UpdatePurchasePaymentDto } from './update-purchase-payment.dto';

export class CreatePurchasePaymentDto extends UpdatePurchasePaymentDto {
  supplier_id: number;
  purchase_payment_allocations: Array<CreatePurchasePaymentAllocationDto>;
}
