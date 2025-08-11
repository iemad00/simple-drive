import {
  UseGuards,
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { PermGuard } from 'src/common/guards/perm.guard';
import { BackendService } from './backend.service';
import { Backend, isBackend } from 'src/common/types/backend';

@UseGuards(JwtGuard, PermGuard)
@Controller('admin/backend')
export class BackendController {
  constructor(private readonly backendService: BackendService) {}

  @Post('switch')
  @RequirePermissions('backend:update')
  changeBackend(@Body() dto: { backend: Backend }) {
    if (!dto?.backend)
      throw new BadRequestException('Backend field is required');

    if (!isBackend(dto.backend))
      throw new BadRequestException('Invalid backend type');

    return this.backendService.changeBackend(dto.backend);
  }

  @Get('current')
  @RequirePermissions('backend:read')
  getCurrentBackend() {
    return this.backendService.getBackend();
  }
}
