import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { WarehouseService } from './warehouse.service';
import { createWarehouseSchema } from './validator/request/create-warehouse.request';
import { warehouseIdParamSchema } from './validator/param/warehouse-id.param';
import { updateWarehouseSchema } from './validator/request/update-warehouse.request';

@Controller()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createWarehouseSchema))
    createWarehouseDto: CreateWarehouseDto,
  ) {
    return this.warehouseService.create(createWarehouseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.warehouseService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(warehouseIdParamSchema)) id: string,
  ) {
    return this.warehouseService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(warehouseIdParamSchema)) id: string,
    @Body(new JoiValidationPipe(updateWarehouseSchema))
    updateWarehouseDto: CreateWarehouseDto,
  ) {
    return this.warehouseService.update(+id, updateWarehouseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(warehouseIdParamSchema)) id: string,
  ) {
    return this.warehouseService.delete(+id);
  }
}
