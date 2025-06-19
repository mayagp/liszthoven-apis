export class CreateGoodsReceiptDocumentDto {
  goods_receipt_documents: Array<{
    goods_receipt_id: number;
    original_name: string;
    path: string;
    url: string;
    extension: string;
  }>;
}
