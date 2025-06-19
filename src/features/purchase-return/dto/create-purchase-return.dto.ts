import { CreatePurchaseReturnDetailDto } from 'src/features/purchase-return-detail/dto/create-purchase-return-detail.dto';
import { UpdatePurchaseReturnDto } from './update-purchase-return.dto';

export class CreatePurchaseReturnDto extends UpdatePurchaseReturnDto {
  type: number;
  amount: number;
  destination: number;
  supplier_id: number;
  purchase_return_details: Array<CreatePurchaseReturnDetailDto>;
}
