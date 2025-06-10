import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createStockMovementSchema } from './validator/request/create-stock-adjustment.request';
import { stockMovementIdParamSchema } from './validator/param/stock-movement-id.param';

@Controller()
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createStockMovementSchema))
    createStockMovementDto: CreateStockMovementDto,
  ) {
    return this.stockMovementService.create(createStockMovementDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.stockMovementService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(stockMovementIdParamSchema))
    id: string,
  ) {
    return this.stockMovementService.findOne(+id);
  }
}
