import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { RequestMiddleware } from './middleware/request.middleware';
import { JwtLocalAuthGuard } from './guards/jwt-local-auth.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfigAsync } from './configs/sequelize.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './features/auth/auth.module';
import { ResponseModule } from './modules/response/response.module';
import { StaffModule } from './features/staff/staff.module';
import { UserModule } from './features/user/user.module';
import { CityModule } from './features/city/city.module';
import { ProvinceModule } from './features/province/province.module';
import { SubdistrictModule } from './features/subdistrict/subdistrict.module';
import { BranchModule } from './features/branch/branch.module';
import routerConfig from './configs/router.config';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    SequelizeModule.forRootAsync(sequelizeConfigAsync),
    EventEmitterModule.forRoot(),
    routerConfig,
    AuthModule,
    ResponseModule,
    // BannersModule,
    UserModule,
    // CompaniesModule,
    BranchModule,
    // UsersAdminModule,
    // CurrenciesAdminModule,
    // ExchangeRatesAdminModule,
    // BrandsAdminModule,
    // ProductCategoriesAdminModule,
    // ProductAdminModule,
    // ProductImageAdminModule,
    // WarehousesAdminModule,
    // SerializeItemsAdminModule,
    // InventoriesAdminModule,
    // InventoryHistoriesAdminModule,
    // SuppliersAdminModule,
    // PurchaseOrdersAdminModule,
    // PurchaseOrderDetailsAdminModule,
    // PurchaseInvoicesAdminModule,
    // // PurchaseOrderWarehousesAdminModule,
    // PurchaseInvoiceDetailsAdminModule,
    // GoodsReceiptsAdminModule,
    // GoodsReceiptDetailsAdminModule,
    // SupplierQuotationsAdminModule,
    // SupplierQuotationDetailsAdminModule,
    // PurchaseRequestsAdminModule,
    // PurchaseRequestDetailsAdminModule,
    // PurchasePaymentsAdminModule,
    // PurchasePaymentAllocationsAdminModule,
    // PurchaseNotesAdminModule,
    // PurchaseNoteDetailsAdminModule,
    // PurchaseReturnsAdminModule,
    // PurchaseReturnDetailsAdminModule,
    // InventoryTransactionsAdminModule,
    // StockMovementsAdminModule,
    // SupplierBankAccountsAdminModule,
    // PurchasePlansAdminModule,
    // PlanImplementsAdminModule,
    // CustomerAddressesAdminModule,
    // AutoNumbersAdminModule,
    // PurchaseOrderDocumentsAdminModule,
    // PurchaseInvoiceDocumentsAdminModule,
    // PurchaseReturnDocumentsAdminModule,
    // GoodsReceiptDocumentsAdminModule,
    // PurchasePaymentDocumentsAdminModule,
    ProvinceModule,
    CityModule,
    SubdistrictModule,
    // ProductModule,
    // CompaniesPublicModule,
    // AccountTypesAdminModule,
    // CoaGroupsAdminModule,
    // ChartOfAccountsAdminModule,
    // AccountBalancesAdminModule,
    // JournalsAdminModule,
    // JournalDetailsAdminModule,
    // PurchasePaymentCoasAdminModule,
    // UserDocumentsAdminModule,
    // TaskSchedulesAdminModule,
    // ScheduleModule.forRoot(),
    // BrandsModule,
    // ProductCategoriesModule,
    // NotificationModule,
    // TransactionDetailsAdminModule,
    // SchoolsAdminModule,
    // SchoolsModule,
    // TransactionDetailsModule,
    // CountryModule,
    // CountryAdminModule,
    StaffModule,
    // StudentGuardianAdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtLocalAuthGuard,
    // NotificationListener,
    // CronSystemService,
  ],
  exports: [JwtLocalAuthGuard],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Apply to all routes
  }
}
