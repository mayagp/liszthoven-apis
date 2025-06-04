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
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createBranchSchema } from './validator/request/create-branch.request';
import { branchIdParamSchema } from './validator/param/branch-id.param';

@Controller()
export class BranchController {
  constructor(private readonly branchesAdminService: BranchService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createBranchSchema))
    createBranchDto: CreateBranchDto,
  ) {
    return this.branchesAdminService.create(createBranchDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.branchesAdminService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(branchIdParamSchema)) id: string,
  ) {
    return this.branchesAdminService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(branchIdParamSchema)) id: string,
    @Body(new JoiValidationPipe(createBranchSchema))
    updateBranchDto: CreateBranchDto,
  ) {
    return this.branchesAdminService.update(+id, updateBranchDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(branchIdParamSchema)) id: string,
  ) {
    return this.branchesAdminService.delete(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put(':id/assign')
  // assignBranch(
  //   @Param('id', new JoiValidationParamPipe(branchIdParamSchema)) id: string,
  //   @Body(new JoiValidationPipe(assignBranchSchema))
  //   assignBranchDto: AssignBranchDto,
  // ) {
  //   return this.branchesAdminService.assignBranch(+id, assignBranchDto);
  // }
}
