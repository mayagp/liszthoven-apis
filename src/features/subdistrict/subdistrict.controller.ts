import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubdistrictService } from './subdistrict.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { CreateSubdistrictDto } from './dto/create-subdistrict.dto';
import { createSubdistrictSchema } from './validator/request/create-subdistrict.request';
import { subdistrictIdParamSchema } from './validator/param/subdistrict-id.param';

@Controller()
export class SubdistrictController {
  constructor(private readonly subdistrictService: SubdistrictService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: any) {
    return this.subdistrictService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.subdistrictService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new JoiValidationPipe(createSubdistrictSchema))
    createSubdistrictDto: CreateSubdistrictDto,
  ) {
    return this.subdistrictService.create(createSubdistrictDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new JoiValidationParamPipe(subdistrictIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createSubdistrictSchema))
    updateSubdistrictDto: CreateSubdistrictDto,
  ) {
    return this.subdistrictService.update(+id, updateSubdistrictDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id', new JoiValidationParamPipe(subdistrictIdParamSchema))
    id: string,
  ) {
    return this.subdistrictService.delete(+id);
  }
}
