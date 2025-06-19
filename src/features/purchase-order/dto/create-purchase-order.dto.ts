import { CreatePurchaseOrderDetailDto } from 'src/features/purchase-order-detail/dto/create-purchase-order-detail.dto';
import { UpdatePurchaseOrderDto } from './update-purchase-order.dto';

export class CreatePurchaseOrderDto extends UpdatePurchaseOrderDto {
  purchase_order_details: Array<CreatePurchaseOrderDetailDto>;
}
