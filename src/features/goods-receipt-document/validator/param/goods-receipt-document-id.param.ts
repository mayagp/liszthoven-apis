import * as Joi from 'joi';
import { GoodsReceiptDocument } from '../../entities/goods-receipt-document.entity';

export const goodsReceiptDocumentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const goodsReceiptDocument = await GoodsReceiptDocument.findByPk(value);
    if (!goodsReceiptDocument) {
      throw new Joi.ValidationError(
        'any.invalid-goods-receipt-document-id',
        [
          {
            message: 'Goods receipt document not found',
            path: ['id'],
            type: 'any.invalid-goods-receipt-document-id',
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
