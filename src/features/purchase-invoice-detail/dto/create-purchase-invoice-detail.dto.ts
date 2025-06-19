export class CreatePurchaseInvoiceDetailDto {
  product_id: number;
  quantity: number;
  remaining_quantity: number;
  unit_price: number;
  subtotal: number;
  update_order: boolean;
}
