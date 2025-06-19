import { GoodsReceiptDetailDto } from 'src/features/goods-receipt-detail/dto/goods-receipt-detail.dto';
import { UpdateGoodsReceiptDto } from './update-goods-receipt.dto';

export class CreateGoodsReceiptDto extends UpdateGoodsReceiptDto {
  goods_receipt_no: string;
  warehouse_id: number;
  goods_receipt_details: Array<GoodsReceiptDetailDto>;
}
