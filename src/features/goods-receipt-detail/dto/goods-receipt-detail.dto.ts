export class GoodsReceiptDetailDto {
  product_id: number;
  quantity: number;
  gr_serial_numbers: Array<{ serial_number: string }>;
}
