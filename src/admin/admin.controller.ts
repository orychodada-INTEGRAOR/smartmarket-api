import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  @Roles('admin')
  getUsers() {
    return this.admin.getUsers();
  }

  @Post('role')
  @Roles('admin')
  createRole(@Body() body: { name: string }) {
    return this.admin.createRole(body.name);
  }

  @Post('assign-role')
  @Roles('admin')
  assignRole(
    @Body() body: { userId: string; roleName: string },
  ) {
    return this.admin.assignRoleToUser(body.userId, body.roleName);
  }
}