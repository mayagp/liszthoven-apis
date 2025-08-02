import { UpdatePurchasePlanDto } from './update-purchase-plan.dto';

export class CreatePurchasePlanDto extends UpdatePurchasePlanDto {
  warehouse_id: number;
  product_id: number;
}
