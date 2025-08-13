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
import { Ok } from 'src/common/helpers/responses';

@UseGuards(JwtGuard, PermGuard)
@Controller('admin/backend')
export class BackendController {
  constructor(private readonly backendService: BackendService) {}

  @Post('switch')
  @RequirePermissions('backend:update')
  async changeBackend(@Body() dto: { backend: Backend }) {
    if (!dto?.backend)
      throw new BadRequestException('Backend field is required');

    if (!isBackend(dto.backend))
      throw new BadRequestException('Invalid backend type');

    const { message } = await this.backendService.changeBackend(dto.backend);
    return Ok({ message });
  }

  @Get('current')
  @RequirePermissions('backend:read')
  async getCurrentBackend() {
    const data = await this.backendService.getBackend();
    return Ok({ data });
  }
}
