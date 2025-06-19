export class CreatePurchaseReturnDetailDto {
  purchase_return_id: number;
  purchaseable_id: number;
  purchaseable_type: string;
  quantity: number;
  amount: number;
}
