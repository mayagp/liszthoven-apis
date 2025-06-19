import { RouterModule } from '@nestjs/core';
import { AuthModule } from 'src/features/auth/auth.module';
import { AutoNumberModule } from 'src/features/auto-number/auto-number.module';
import { BranchModule } from 'src/features/branch/branch.module';
import { CityModule } from 'src/features/city/city.module';
import { GoodsReceiptDetailModule } from 'src/features/goods-receipt-detail/goods-receipt-detail.module';
import { GoodsReceiptDocumentModule } from 'src/features/goods-receipt-document/goods-receipt-document.module';
import { GoodsReceiptModule } from 'src/features/goods-receipt/goods-receipt.module';
import { InventoryHistoryModule } from 'src/features/inventory-history/inventory-history.module';
import { InventoryTransactionModule } from 'src/features/inventory-transaction/inventory-transaction.module';
import { InventoryModule } from 'src/features/inventory/inventory.module';
import { ProductCategoryModule } from 'src/features/product-category/product-category.module';
import { ProductImageModule } from 'src/features/product-image/product-image.module';
import { ProductModule } from 'src/features/product/product.module';
import { ProvinceModule } from 'src/features/province/province.module';
import { PurchaseInvoiceDetailModule } from 'src/features/purchase-invoice-detail/purchase-invoice-detail.module';
import { PurchaseInvoiceDocumentModule } from 'src/features/purchase-invoice-document/purchase-invoice-document.module';
import { PurchaseInvoiceModule } from 'src/features/purchase-invoice/purchase-invoice.module';
import { PurchaseOrderDetailModule } from 'src/features/purchase-order-detail/purchase-order-detail.module';
import { PurchaseOrderDocumentModule } from 'src/features/purchase-order-document/purchase-order-document.module';
import { PurchaseOrderModule } from 'src/features/purchase-order/purchase-order.module';
import { PurchasePaymentAllocationModule } from 'src/features/purchase-payment-allocation/purchase-payment-allocation.module';
import { PurchasePaymentDocumentModule } from 'src/features/purchase-payment-document/purchase-payment-document.module';
import { PurchasePaymentModule } from 'src/features/purchase-payment/purchase-payment.module';
import { PurchaseRequestDetailModule } from 'src/features/purchase-request-detail/purchase-request-detail.module';
import { PurchaseRequestModule } from 'src/features/purchase-request/purchase-request.module';
import { PurchaseReturnDetailModule } from 'src/features/purchase-return-detail/purchase-return-detail.module';
import { PurchaseReturnDocumentModule } from 'src/features/purchase-return-document/purchase-return-document.module';
import { PurchaseReturnModule } from 'src/features/purchase-return/purchase-return.module';
import { SerializeItemModule } from 'src/features/serialize-item/serialize-item.module';
import { StaffModule } from 'src/features/staff/staff.module';
import { StockMovementModule } from 'src/features/stock-movement/stock-movement.module';
import { SubdistrictModule } from 'src/features/subdistrict/subdistrict.module';
import { SupplierBankAccountModule } from 'src/features/supplier-bank-account/supplier-bank-account.module';
import { SupplierQuotationDetailModule } from 'src/features/supplier-quotation-detail/supplier-quotation-detail.module';
import { SupplierQuotationModule } from 'src/features/supplier-quotation/supplier-quotation.module';
import { SupplierModule } from 'src/features/supplier/supplier.module';
import { UserModule } from 'src/features/user/user.module';
import { WarehouseModule } from 'src/features/warehouse/warehouse.module';

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
          {
            path: 'product-categories',
            module: ProductCategoryModule,
          },
          {
            path: 'products',
            module: ProductModule,
            children: [
              {
                path: ':id/images',
                module: ProductImageModule,
              },
            ],
          },
          {
            path: 'warehouses',
            module: WarehouseModule,
          },
          {
            path: 'serialize-items',
            module: SerializeItemModule,
          },
          {
            path: 'inventories',
            module: InventoryModule,
          },
          {
            path: 'inventory-histories',
            module: InventoryHistoryModule,
          },
          {
            path: 'suppliers',
            module: SupplierModule,
            children: [
              {
                path: ':supplierId/details',
                module: SupplierBankAccountModule,
              },
            ],
          },
          {
            path: 'purchase-orders',
            module: PurchaseOrderModule,
            children: [
              {
                path: ':orderId/details',
                module: PurchaseOrderDetailModule,
                // children: [
                //   {
                //     path: ':detailId/warehouses',
                //     module: PurchaseOrderWarehousesAdminModule,
                //   },
                // ],
              },
              {
                path: ':orderId/documents',
                module: PurchaseOrderDocumentModule,
              },
            ],
          },
          {
            path: 'purchase-invoices',
            module: PurchaseInvoiceModule,
            children: [
              {
                path: ':invoiceId/details',
                module: PurchaseInvoiceDetailModule,
              },
              {
                path: ':invoiceId/documents',
                module: PurchaseInvoiceDocumentModule,
              },
            ],
          },
          {
            path: 'goods-receipts',
            module: GoodsReceiptModule,
            children: [
              {
                path: ':goodsReceiptId/details',
                module: GoodsReceiptDetailModule,
              },
              {
                path: ':goodsReceiptId/documents',
                module: GoodsReceiptDocumentModule,
              },
            ],
          },
          {
            path: 'supplier-quotations',
            module: SupplierQuotationModule,
            children: [
              {
                path: ':supplierQuotationId/details',
                module: SupplierQuotationDetailModule,
              },
            ],
          },
          {
            path: 'purchase-requests',
            module: PurchaseRequestModule,
            children: [
              {
                path: ':purchaseRequestId/details',
                module: PurchaseRequestDetailModule,
              },
            ],
          },
          {
            path: 'purchase-payments',
            module: PurchasePaymentModule,
            children: [
              {
                path: ':purchasePaymentId/details',
                module: PurchasePaymentAllocationModule,
              },
              {
                path: ':purchasePaymentId/documents',
                module: PurchasePaymentDocumentModule,
              },
            ],
          },
          // {
          //   path: 'purchase-notes',
          //   module: PurchaseNotesAdminModule,
          //   children: [
          //     {
          //       path: ':purchaseNoteId/details',
          //       module: PurchaseNoteDetailsAdminModule,
          //     },
          //   ],
          // },
          {
            path: 'purchase-returns',
            module: PurchaseReturnModule,
            children: [
              {
                path: ':purchaseReturnId/details',
                module: PurchaseReturnDetailModule,
              },
              {
                path: ':purchaseReturnId/documents',
                module: PurchaseReturnDocumentModule,
              },
            ],
          },
          {
            path: 'inventory-transactions',
            module: InventoryTransactionModule,
          },
          {
            path: 'stock-movements',
            module: StockMovementModule,
          },
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
          {
            path: 'auto-numbers',
            module: AutoNumberModule,
          },
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
