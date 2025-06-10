import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SupplierBankAccountService } from './supplier-bank-account.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { CreateSupplierBankAccountDto } from './dto/create-supplier-bank-account.dto';
import { createSupplierBankAccountSchema } from './validator/request/create-supplier-bank-account.request';
import { supplierIdParamSchema } from '../supplier/validator/param/supplier-id.param';
import { supplierBankAccountIdParamSchema } from './validator/param/supplier-bank-account-id.param';

@Controller()
export class SupplierBankAccountController {
  constructor(
    private readonly supplierBankAccountService: SupplierBankAccountService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createSupplierBankAccountSchema))
    createSupplierBankAccountDto: CreateSupplierBankAccountDto,
    @Param('supplierId', new JoiValidationParamPipe(supplierIdParamSchema))
    supplierId: string,
  ) {
    return this.supplierBankAccountService.create(
      +supplierId,
      createSupplierBankAccountDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('supplierId', new JoiValidationParamPipe(supplierIdParamSchema))
    supplierId: string,
    @Param('id', new JoiValidationParamPipe(supplierBankAccountIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createSupplierBankAccountSchema))
    updateSupplierBankAccountDto: CreateSupplierBankAccountDto,
  ) {
    return this.supplierBankAccountService.update(
      +supplierId,
      +id,
      updateSupplierBankAccountDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('supplierId', new JoiValidationParamPipe(supplierIdParamSchema))
    supplierId: string,
    @Param('id', new JoiValidationParamPipe(supplierBankAccountIdParamSchema))
    id: string,
  ) {
    return this.supplierBankAccountService.delete(+supplierId, +id);
  }
}
