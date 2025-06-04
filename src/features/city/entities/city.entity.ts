import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'cities',
  modelName: 'cities',
})
export class City extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  postal_code: string;

  @Column(DataType.BIGINT)
  province_id: number;
}
