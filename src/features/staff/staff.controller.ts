import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { staffIdParamSchema } from './validator/staff-id.param';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.staffService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(staffIdParamSchema)) id: string,
  ) {
    return this.staffService.findOne(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // @Post('import')
  // importStaff(@UploadedFile() file: Express.Multer.File) {
  //   return this.staffService.importStaff(file);
  // }
}
