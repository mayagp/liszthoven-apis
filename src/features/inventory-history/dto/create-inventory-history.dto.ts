import InventoryHistoryTypeEnum from '../enums/inventory-history-type.enum';

export class CreateInventoryHistoryDto {
  inventory_id: number;
  date: Date;
  quantity: number;
  able_id: number;
  able_model: string;
  type: InventoryHistoryTypeEnum;
  quantity_change: number;
  remaining_quantity: number;
}
