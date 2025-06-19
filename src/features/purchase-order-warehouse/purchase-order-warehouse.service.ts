import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrderWarehouseDto } from './dto/create-purchase-order-warehouse.dto';

@Injectable()
export class PurchaseOrderWarehouseService {
  create(createPurchaseOrderWarehouseDto: CreatePurchaseOrderWarehouseDto) {
    return 'This action adds a new purchaseOrderWarehouse';
  }

  findAll() {
    return `This action returns all purchaseOrderWarehouse`;
  }

  findOne(id: number) {
    return `This action returns a #${id} purchaseOrderWarehouse`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchaseOrderWarehouse`;
  }
}
