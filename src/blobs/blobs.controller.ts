import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt.guard';
import { User } from '../common/decorators/user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { PermGuard } from 'src/common/guards/perm.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';

@UseGuards(JwtGuard, PermGuard) // protect all routes in this controller
@Controller('blobs')
export class BlobsController {
  @Post()
  @RequirePermissions('blobs:create')
  create(@User() user: RequestUser, @Body() dto: { id: string; data: string }) {
    console.log(dto);

    return { ok: true, owner: user.sub };
  }

  @Get(':id')
  getOne(@User() user: RequestUser, @Param('id') id: string) {
    return { id, requestedBy: user.sub };
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return { deleted: id, by: user.sub };
  }
}
