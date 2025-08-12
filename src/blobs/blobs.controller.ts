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
import { BlobsService } from './blobs.service';

@UseGuards(JwtGuard) // only auth required for user blob actions
@Controller('blobs')
export class BlobsController {
  constructor(private readonly blobsService: BlobsService) {}

  @Post()
  create(@User() user: RequestUser, @Body() dto: { id: string; data: string }) {
    return this.blobsService.createBlob(user.sub, dto.id, dto.data);
  }

  @Get(':id')
  getOne(@User() user: RequestUser, @Param('id') id: string) {
    return this.blobsService.getBlob(user.sub, id);
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.blobsService.deleteBlob(user.sub, id);
  }
}
