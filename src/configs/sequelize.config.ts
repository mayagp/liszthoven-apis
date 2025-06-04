import { ConfigService, ConfigModule } from '@nestjs/config';
import {
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';

export default class SequelizeConfig {
  public static getConfig(
    configService: ConfigService,
  ): SequelizeModuleOptions {
    return {
      dialect: configService.get('DB_DRIVER') || 'mysql',
      host: configService.get('DB_HOST') || 'localhost',
      port: configService.get('DB_PORT') || 3306,
      username: configService.get('DB_USER') || 'root',
      password: configService.get('DB_PASSWORD') || '',
      database: configService.get('DB_NAME') || '',
      logging: false,
      autoLoadModels: true,
      models: [__dirname + '/**/*.entity{.ts,.js}'],
      modelMatch: (filename, member) => {
        return (
          filename.substring(0, filename.indexOf('.entity')) ===
          member.toLowerCase()
        );
      },
      synchronize: false,
    };
  }
}

export const sequelizeConfigAsync: SequelizeModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService,
  ): Promise<SequelizeModuleOptions> =>
    SequelizeConfig.getConfig(configService),
  inject: [ConfigService],
};
