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
import { InventoryHistoryModule } from './features/inventory-history/inventory-history.module';
import { InventoryTransactionModule } from './features/inventory-transaction/inventory-transaction.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { ProductCategoryModule } from './features/product-category/product-category.module';
import { ProductImageModule } from './features/product-image/product-image.module';
import { ProductModule } from './features/product/product.module';
import { SupplierQuotationDetailModule } from './features/supplier-quotation-detail/supplier-quotation-detail.module';
import { SupplierQuotationModule } from './features/supplier-quotation/supplier-quotation.module';
import { SupplierModule } from './features/supplier/supplier.module';
import { WarehouseModule } from './features/warehouse/warehouse.module';
import { SupplierBankAccountModule } from './features/supplier-bank-account/supplier-bank-account.module';
import { SerializeItemModule } from './features/serialize-item/serialize-item.module';
import { AutoNumberModule } from './features/auto-number/auto-number.module';
import { GoodsReceiptDetailModule } from './features/goods-receipt-detail/goods-receipt-detail.module';
import { GoodsReceiptDocumentModule } from './features/goods-receipt-document/goods-receipt-document.module';
import { GoodsReceiptModule } from './features/goods-receipt/goods-receipt.module';
import { PurchaseInvoiceDetailModule } from './features/purchase-invoice-detail/purchase-invoice-detail.module';
import { PurchaseInvoiceDocumentModule } from './features/purchase-invoice-document/purchase-invoice-document.module';
import { PurchaseInvoiceModule } from './features/purchase-invoice/purchase-invoice.module';
import { PurchaseOrderDetailModule } from './features/purchase-order-detail/purchase-order-detail.module';
import { PurchaseOrderDocumentModule } from './features/purchase-order-document/purchase-order-document.module';
import { PurchaseOrderModule } from './features/purchase-order/purchase-order.module';
import { PurchasePaymentAllocationModule } from './features/purchase-payment-allocation/purchase-payment-allocation.module';
import { PurchasePaymentDocumentModule } from './features/purchase-payment-document/purchase-payment-document.module';
import { PurchasePaymentModule } from './features/purchase-payment/purchase-payment.module';
import { PurchaseRequestDetailModule } from './features/purchase-request-detail/purchase-request-detail.module';
import { PurchaseRequestModule } from './features/purchase-request/purchase-request.module';
import { PurchaseReturnDetailModule } from './features/purchase-return-detail/purchase-return-detail.module';
import { PurchaseReturnDocumentModule } from './features/purchase-return-document/purchase-return-document.module';
import { PurchaseReturnModule } from './features/purchase-return/purchase-return.module';
import { StockMovementModule } from './features/stock-movement/stock-movement.module';

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
    // CurrenciesAdminModule,
    // ExchangeRatesAdminModule,
    // BrandsAdminModule,
    ProductCategoryModule,
    ProductModule,
    ProductImageModule,
    WarehouseModule,
    SerializeItemModule,
    InventoryModule,
    InventoryHistoryModule,
    SupplierModule,
    PurchaseOrderModule,
    PurchaseOrderDetailModule,
    PurchaseInvoiceModule,
    // PurchaseOrderWarehousesAdminModule,
    PurchaseInvoiceDetailModule,
    GoodsReceiptModule,
    GoodsReceiptDetailModule,
    SupplierQuotationModule,
    SupplierQuotationDetailModule,
    PurchaseRequestModule,
    PurchaseRequestDetailModule,
    PurchasePaymentModule,
    PurchasePaymentAllocationModule,
    // PurchaseNotesAdminModule,
    // PurchaseNoteDetailsAdminModule,
    PurchaseReturnModule,
    PurchaseReturnDetailModule,
    InventoryTransactionModule,
    StockMovementModule,
    SupplierBankAccountModule,
    // PurchasePlansAdminModule,
    // PlanImplementsAdminModule,
    // CustomerAddressesAdminModule,
    AutoNumberModule,
    PurchaseOrderDocumentModule,
    PurchaseInvoiceDocumentModule,
    PurchaseReturnDocumentModule,
    GoodsReceiptDocumentModule,
    PurchasePaymentDocumentModule,
    ProvinceModule,
    CityModule,
    SubdistrictModule,
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
