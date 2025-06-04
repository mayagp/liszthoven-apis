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
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { provinceIdParamSchema } from './validator/params/province-id.param';
import { createProvinceSchema } from './validator/request/create-province.request';

@Controller()
export class ProvinceController {
  constructor(private readonly provincesAdminService: ProvinceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: any) {
    return this.provincesAdminService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', new JoiValidationParamPipe(provinceIdParamSchema)) id: string,
  ) {
    return this.provincesAdminService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new JoiValidationPipe(createProvinceSchema))
    createProvinceDto: CreateProvinceDto,
  ) {
    return this.provincesAdminService.create(createProvinceDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new JoiValidationParamPipe(provinceIdParamSchema)) id: string,
    @Body(new JoiValidationPipe(createProvinceSchema))
    updateProvinceDto: CreateProvinceDto,
  ) {
    return this.provincesAdminService.update(+id, updateProvinceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id', new JoiValidationParamPipe(provinceIdParamSchema)) id: string,
  ) {
    return this.provincesAdminService.delete(+id);
  }
}
