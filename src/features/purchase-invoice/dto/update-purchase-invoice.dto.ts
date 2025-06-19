export class UpdatePurchaseInvoiceDto {
  invoice_no: string;
  purchase_order_id: number;
  date: Date;
  due_date: Date;
  tax: number;
  shipping_cost: number;
  note: string;
  supplier_id: number;
  branch_id: number;
  grandtotal: number;
}
