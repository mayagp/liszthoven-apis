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
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { cityIdParamSchema } from './validator/param/city-id.param';
import { createCitySchema } from './validator/request/create-city.request';

@Controller()
export class CityController {
  constructor(private readonly citiesAdminService: CityService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: any) {
    return this.citiesAdminService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', new JoiValidationParamPipe(cityIdParamSchema)) id: string,
  ) {
    return this.citiesAdminService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new JoiValidationPipe(createCitySchema)) createCityDto: CreateCityDto,
  ) {
    return this.citiesAdminService.create(createCityDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new JoiValidationParamPipe(cityIdParamSchema)) id: string,
    @Body(new JoiValidationPipe(createCitySchema)) updateCityDto: CreateCityDto,
  ) {
    return this.citiesAdminService.update(+id, updateCityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id', new JoiValidationParamPipe(cityIdParamSchema)) id: string,
  ) {
    return this.citiesAdminService.delete(+id);
  }
}
