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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { userIdParamSchema } from './validator/param/user-id.param';
import { UpdateUserAdminDto } from './dto/update-user.admin.dto';
import { updateStaffProfileSchema } from './validator/request/update-staff-profile.request';
import { assignStaffSchema } from './validator/request/assign-staff.request';
import { AssignStaffDto } from '../staff/dto/assign-staff.dto';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@CurrentUser() user) {
    return this.userService.profile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.userService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(userIdParamSchema))
    id: string,
  ) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateProfile(
    @Param('id', new JoiValidationParamPipe(userIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updateStaffProfileSchema))
    updateStaffProfileSchema: UpdateUserAdminDto,
  ) {
    return this.userService.update(+id, updateStaffProfileSchema);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post(':id/profile-picture')
  // @UseInterceptors(FileInterceptor('image'))
  // updateProfilePicture(
  //   @Param('id', new JoiValidationParamPipe(userIdParamSchema))
  //   id: string,
  //   @UploadedFile() image: Express.Multer.File,
  // ) {
  //   return this.userService.updateProfilePicture(+id, image);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Put('staff/:id/assign')
  // assignStaff(
  //   @Param('id') id: string,
  //   @Body(new JoiValidationPipe(assignStaffSchema))
  //   assignStaffDto: AssignStaffDto,
  // ) {
  //   return this.userService.assignStaff(+id, assignStaffDto);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('staff/:id/remove')
  // removeStaff(
  //   @Param('id') id: string,
  //   @Body(new JoiValidationPipe(assignStaffSchema))
  //   removeStaffDto: AssignStaffDto,
  // ) {
  //   return this.userService.removeStaff(+id, removeStaffDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUser(
    @Param('id', new JoiValidationParamPipe(userIdParamSchema))
    id: string,
  ) {
    return this.userService.deleteUser(+id);
  }
}
