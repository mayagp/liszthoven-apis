import * as Joi from 'joi';
import { GoodsReceipt } from '../../entities/goods-receipt.entity';

export const goodsReceiptIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const goodsReceipt = await GoodsReceipt.findByPk(value);
    if (!goodsReceipt) {
      throw new Joi.ValidationError(
        'any.invalid-goods-receipt-id',
        [
          {
            message: 'Goods receipt not found',
            path: ['id'],
            type: 'any.invalid-goods-receipt-id',
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
