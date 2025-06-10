export class CreateStockMovementDto {
  product_id: number;
  quantity: number;
  date: Date;
  from_id: number;
  to_id: number;
  note: string;
  type: number;
}
