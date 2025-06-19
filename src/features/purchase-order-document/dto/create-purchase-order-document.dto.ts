export class CreatePurchaseOrderDocumentDto {
  purchase_order_documents: Array<{
    purchase_order_id: number;
    original_name: string;
    path: string;
    url: string;
    extension: string;
  }>;
}
