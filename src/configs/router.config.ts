import { RouterModule } from '@nestjs/core';
import { AuthModule } from 'src/features/auth/auth.module';
import { BranchModule } from 'src/features/branch/branch.module';
import { CityModule } from 'src/features/city/city.module';
import { ProvinceModule } from 'src/features/province/province.module';
import { StaffModule } from 'src/features/staff/staff.module';
import { SubdistrictModule } from 'src/features/subdistrict/subdistrict.module';
import { UserModule } from 'src/features/user/user.module';

export default RouterModule.register([
  {
    path: '/api/v1',
    children: [
      {
        path: '/',
        children: [
          {
            path: 'auth',
            module: AuthModule,
          },
          //   {
          //     path: 'companies',
          //     module: CompaniesModule,
          //   },
          {
            path: 'branches',
            module: BranchModule,
          },
          {
            path: 'users',
            module: UserModule,
            // children: [
            //   {
            //     path: ':userId/documents',
            //     module: UserDocumentsAdminModule,
            //   },
            // ],
          },
          {
            path: 'staff',
            module: StaffModule,
          },
          //   {
          //     path: 'currencies',
          //     module: CurrenciesAdminModule,
          //   },
          //   {
          //     path: 'exchange-rates',
          //     module: ExchangeRatesAdminModule,
          //   },
          //   {
          //     path: 'brands',
          //     module: BrandsAdminModule,
          //   },
          //   {
          //     path: 'product-categories',
          //     module: ProductCategoryModule,
          //   },
          //   {
          //     path: 'products',
          //     module: ProductModule,
          //     children: [
          //       {
          //         path: ':id/images',
          //         module: ProductImageModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'warehouses',
          //     module: WarehousesAdminModule,
          //   },
          //   {
          //     path: 'serialize-items',
          //     module: SerializeItemsAdminModule,
          //   },
          //   {
          //     path: 'inventories',
          //     module: InventoriesAdminModule,
          //   },
          //   {
          //     path: 'inventory-histories',
          //     module: InventoryHistoriesAdminModule,
          //   },
          //   {
          //     path: 'suppliers',
          //     module: SuppliersAdminModule,
          //     children: [
          //       {
          //         path: ':supplierId/details',
          //         module: SupplierBankAccountsAdminModule,
          //       },
          //     ],
          // //   },
          //   {
          //     path: 'purchase-orders',
          //     module: PurchaseOrdersAdminModule,
          //     children: [
          //       {
          //         path: ':orderId/details',
          //         module: PurchaseOrderDetailsAdminModule,
          //         // children: [
          //         //   {
          //         //     path: ':detailId/warehouses',
          //         //     module: PurchaseOrderWarehousesAdminModule,
          //         //   },
          //         // ],
          //       },
          //       {
          //         path: ':orderId/documents',
          //         module: PurchaseOrderDocumentsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'purchase-invoices',
          //     module: PurchaseInvoiceModule,
          //     children: [
          //       {
          //         path: ':invoiceId/details',
          //         module: PurchaseInvoiceDetailModule,
          //       },
          //       {
          //         path: ':invoiceId/documents',
          //         module: PurchaseInvoiceDocumentModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'goods-receipts',
          //     module: GoodsReceiptsAdminModule,
          //     children: [
          //       {
          //         path: ':goodsReceiptId/details',
          //         module: GoodsReceiptDetailsAdminModule,
          //       },
          //       {
          //         path: ':goodsReceiptId/documents',
          //         module: GoodsReceiptDocumentsAdminModule,
          //       },
          //     ],
          // //   },
          //   {
          //     path: 'supplier-quotations',
          //     module: SupplierQuotationsAdminModule,
          //     children: [
          //       {
          //         path: ':supplierQuotationId/details',
          //         module: SupplierQuotationDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'purchase-requests',
          //     module: PurchaseRequestsAdminModule,
          //     children: [
          //       {
          //         path: ':purchaseRequestId/details',
          //         module: PurchaseRequestDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'purchase-payments',
          //     module: PurchasePaymentsAdminModule,
          //     children: [
          //       {
          //         path: ':purchasePaymentId/details',
          //         module: PurchasePaymentAllocationsAdminModule,
          //       },
          //       {
          //         path: ':purchasePaymentId/documents',
          //         module: PurchasePaymentDocumentsAdminModule,
          //       },
          //       {
          //         path: ':purchasePaymentId/coas',
          //         module: PurchasePaymentCoasAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'purchase-notes',
          //     module: PurchaseNotesAdminModule,
          //     children: [
          //       {
          //         path: ':purchaseNoteId/details',
          //         module: PurchaseNoteDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'purchase-returns',
          //     module: PurchaseReturnsAdminModule,
          //     children: [
          //       {
          //         path: ':purchaseReturnId/details',
          //         module: PurchaseReturnDetailsAdminModule,
          //       },
          //       {
          //         path: ':purchaseReturnId/documents',
          //         module: PurchaseReturnDocumentsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'inventory-transactions',
          //     module: InventoryTransactionsAdminModule,
          //   },
          //   {
          //     path: 'stock-movements',
          //     module: StockMovementsAdminModule,
          //   },
          //   {
          //     path: 'purchase-plans',
          //     module: PurchasePlansAdminModule,
          //     children: [
          //       {
          //         path: ':purchasePlanId/implements',
          //         module: PlanImplementsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'sale-quotations',
          //     module: SaleQuotationsAdminModule,
          //     children: [
          //       {
          //         path: ':saleQuotationId/details',
          //         module: SaleQuotationDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'delivery-orders',
          //     module: DeliveryOrdersAdminModule,
          //     children: [
          //       {
          //         path: ':deliveryOrderId/details',
          //         module: DeliveryOrderDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'auto-numbers',
          //     module: AutoNumbersAdminModule,
          //   },
          {
            path: 'provinces',
            module: ProvinceModule,
          },
          {
            path: 'cities',
            module: CityModule,
          },
          {
            path: 'subdistricts',
            module: SubdistrictModule,
          },
          //   {
          //     path: 'account-types',
          //     module: AccountTypesAdminModule,
          //   },
          //   {
          //     path: 'coa-groups',
          //     module: CoaGroupsAdminModule,
          //   },
          //   {
          //     path: 'chart-of-accounts',
          //     module: ChartOfAccountsAdminModule,
          //   },
          //   {
          //     path: 'account-balances',
          //     module: AccountBalancesAdminModule,
          //   },
          //   {
          //     path: 'journals',
          //     module: JournalsAdminModule,
          //     children: [
          //       {
          //         path: ':journalId/details',
          //         module: JournalDetailsAdminModule,
          //       },
          //     ],
          //   },
          //   {
          //     path: 'countries',
          //     module: CountryAdminModule,
          //   },
          //   {
          //     path: 'tax-categories',
          //     module: TaxCategoriesAdminModule,
          //   },
          //   {
          //     path: 'tax-rates',
          //     module: TaxRatesAdminModule,
          //   },
          //   {
          //     path: 'business-unit-coas',
          //     module: BusinessUnitCoasAdminModule,
          //   },
          //   {
          //     path: 'addon-groups',
          //     module: AddonGroupsAdminModule,
          //   },
        ],
      },
    ],
  },
]);
