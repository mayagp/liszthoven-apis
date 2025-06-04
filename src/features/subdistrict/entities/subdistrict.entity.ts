import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'subdistricts',
  modelName: 'subdistricts',
})
export class Subdistrict extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.BIGINT)
  city_id: number;
}
