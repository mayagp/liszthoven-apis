import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateAutoNumberDto } from './dto/create-auto-number.dto';
import { AutoNumberService } from './auto-number.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createAutoNumberSchema } from './validator/request/create-auto-number.request';
import { autoNumberIdParamSchema } from './validator/param/auto-number-id.param';

@Controller()
export class AutoNumberController {
  constructor(private readonly autoNumberService: AutoNumberService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createAutoNumberSchema))
    createAutoNumberDto: CreateAutoNumberDto,
  ) {
    return this.autoNumberService.create(createAutoNumberDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.autoNumberService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(autoNumberIdParamSchema))
    id: string,
  ) {
    return this.autoNumberService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(autoNumberIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createAutoNumberSchema))
    updateAutoNumberDto: CreateAutoNumberDto,
  ) {
    return this.autoNumberService.update(+id, updateAutoNumberDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(autoNumberIdParamSchema))
    id: string,
  ) {
    return this.autoNumberService.delete(+id);
  }
}
