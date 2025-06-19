export class CreatePurchasePaymentDocumentDto {
  purchase_payment_documents: Array<{
    purchase_payment_id: number;
    original_name: string;
    path: string;
    url: string;
    extension: string;
  }>;
}
