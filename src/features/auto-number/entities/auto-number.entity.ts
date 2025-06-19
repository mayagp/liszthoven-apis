import * as moment from 'moment';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  tableName: 'auto_numbers',
  modelName: 'auto_numbers',
  paranoid: true,
})
export class AutoNumber extends Model {
  @Column({
    type: DataType.JSON,
    get() {
      if (typeof this.getDataValue('format') === 'string') {
        return JSON.parse(this.getDataValue('format'));
      } else {
        return this.getDataValue('format');
      }
    },
  })
  format: Array<{ type: string; value: string }>;

  @Column(DataType.STRING)
  table: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  last_number: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: AutoNumber) {
      let result = '';
      let lastNumber = +this.getDataValue('last_number');
      for (const format of this.getDataValue('format')) {
        if (format.type === 'autonumber') {
          const dateFormat = this.getDataValue('format').find(
            (value) => value.type === 'date',
          );
          if (dateFormat) {
            const today = moment().format(dateFormat.value);
            const lastInputDate = moment(this.getDataValue('updatedAt')).format(
              dateFormat.value,
            );

            if (lastInputDate !== today) {
              lastNumber = 0; // restart last_number if date is different
            }
          }

          // get auto number format like 0001
          const getNumber = String(lastNumber + 1).padStart(+format.value, '0');

          result += getNumber;
        } else if (format.type === 'date') {
          result += moment().format(format.value);
        } else {
          result += format.value;
        }
      }
      return result;
    },
  })
  latest_auto_number: string;
}
