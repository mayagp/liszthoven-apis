export class CreatePurchaseOrderDetailDto {
  quotation_no: string;
  supplier_quotation_id?: number;
  product_id: number;
  quantity_ordered: number;
  remaining_quantity: number;
  price_per_unit: number;
  total: number;
  expected_delivery_date?: Date;
  status: number;
}
