import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseRequestDetail } from 'src/features/purchase-request-detail/entities/purchase-request-detail.entity';
import SupplierQuotationStatus from 'src/features/supplier-quotation/enum/supplier-quotation-status.enum';
import { User } from 'src/features/user/entities/user.entity';
import { getPurchaseRequestStatusEnumLabel } from '../enum/purchase-request-status.enum';
import { Branch } from 'src/features/branch/entities/branch.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_requests',
  modelName: 'purchase_requests',
})
export class PurchaseRequest extends Model {
  @Column({ type: DataType.STRING, unique: true })
  purchase_request_no: string;

  @Column(DataType.DATE)
  date: Date;

  @Column({
    type: DataType.TINYINT,
    defaultValue: SupplierQuotationStatus.REQUESTED,
  })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseRequest) {
      return getPurchaseRequestStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @ForeignKey(() => Branch)
  @Column(DataType.BIGINT)
  branch_id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  created_by: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  approved_by: number;

  @BelongsTo(() => Branch)
  branch: Branch;

  @BelongsTo(() => User, { foreignKey: 'created_by' })
  created_by_user: User;

  @BelongsTo(() => User, { foreignKey: 'approved_by' })
  approved_by_user: User;

  @HasMany(() => PurchaseRequestDetail)
  purchase_request_details: PurchaseRequestDetail[];

  static searchable = ['purchase_request_no', 'branch.address'];
}
