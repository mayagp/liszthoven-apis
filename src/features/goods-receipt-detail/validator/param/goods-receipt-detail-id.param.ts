import * as Joi from 'joi';
import { GoodsReceiptDetail } from '../../entities/goods-receipt-detail.entity';

export const goodsReceiptDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const goodsReceiptDetail = await GoodsReceiptDetail.findByPk(value);
    if (!goodsReceiptDetail) {
      throw new Joi.ValidationError(
        'any.invalid-goods-receipt-detail-id',
        [
          {
            message: 'Goods receipt detail not found',
            path: ['id'],
            type: 'any.invalid-goods-receipt-detail-id',
            context: {
              key: 'id',
              label: 'id',
              value,
            },
          },
        ],
        value,
      );
    }
  });
