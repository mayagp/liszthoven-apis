export class CreatePurchaseInvoiceDocumentDto {
  purchase_invoice_documents: Array<{
    purchase_invoice_id: number;
    original_name: string;
    path: string;
    url: string;
    extension: string;
  }>;
}
