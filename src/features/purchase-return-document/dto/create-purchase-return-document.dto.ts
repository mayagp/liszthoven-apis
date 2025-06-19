export class CreatePurchaseReturnDocumentDto {
  purchase_return_documents: Array<{
    purchase_return_id: number;
    original_name: string;
    path: string;
    url: string;
    extension: string;
  }>;
}
