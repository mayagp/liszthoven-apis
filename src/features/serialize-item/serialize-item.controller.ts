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
import { SerializeItemService } from './serialize-item.service';
import { CreateSerializeItemDto } from './dto/create-serialize-item.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { serializeItemIdParamSchema } from './validator/param/serialize-item-id.param';
import { createSerializeItemSchema } from './validator/request/create-serialize-item.request';

@Controller()
export class SerializeItemController {
  constructor(private readonly serializeItemService: SerializeItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createSerializeItemSchema))
    createSerializeItemDto: CreateSerializeItemDto,
  ) {
    return this.serializeItemService.create(createSerializeItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.serializeItemService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(serializeItemIdParamSchema))
    id: string,
  ) {
    return this.serializeItemService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(serializeItemIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createSerializeItemSchema))
    updateSerializeItemDto: CreateSerializeItemDto,
  ) {
    return this.serializeItemService.update(+id, updateSerializeItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(serializeItemIdParamSchema))
    id: string,
  ) {
    return this.serializeItemService.delete(+id);
  }
}
