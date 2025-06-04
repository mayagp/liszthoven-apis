import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize/types';

export default SequelizeModule.forRoot({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'ltv',
  autoLoadModels: true,
  repositoryMode: false,
});
