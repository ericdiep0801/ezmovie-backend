import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { Roles } from '../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../users/domain/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('tables')
  getTables() {
    return this.adminService.getTables();
  }

  @Get('data/:table')
  getTableData(
    @Param('table') table: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('filters') filters?: string,
  ) {
    return this.adminService.getTableData(table, page ? +page : 1, limit ? +limit : 20, search, filters);
  }

  @Post('data/:table')
  insertData(@Param('table') table: string, @Body() data: any) {
    return this.adminService.insertData(table, data);
  }

  @Put('data/:table/:id')
  updateData(@Param('table') table: string, @Param('id') id: string, @Body() data: any) {
    return this.adminService.updateData(table, id, data);
  }

  @Delete('data/:table/:id')
  deleteData(@Param('table') table: string, @Param('id') id: string) {
    return this.adminService.deleteData(table, id);
  }

  @Post('data/:table/batch-delete')
  batchDelete(@Param('table') table: string, @Body('ids') ids: any[]) {
    return this.adminService.batchDelete(table, ids);
  }

  @Post('data/:table/batch-insert')
  batchInsert(@Param('table') table: string, @Body('data') data: any[]) {
    return this.adminService.batchInsert(table, data);
  }
}
