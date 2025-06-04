import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'provinces',
  modelName: 'provinces',
})
export class Province extends Model {
  @Column(DataType.STRING)
  name: string;
}
