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
import { Ok } from '../common/helpers/responses';

@UseGuards(JwtGuard)
@Controller('blobs')
export class BlobsController {
  constructor(private readonly blobsService: BlobsService) {}

  @Post()
  async create(
    @User() user: RequestUser,
    @Body() dto: { id: string; data: string },
  ) {
    const blob = await this.blobsService.createBlob(user.sub, dto.id, dto.data);
    return Ok({ data: blob });
  }

  @Get(':id')
  async getOne(@User() user: RequestUser, @Param('id') id: string) {
    const blob = await this.blobsService.getBlob(user.sub, id);
    return Ok({ data: blob });
  }

  @Delete(':id')
  async remove(@User() user: RequestUser, @Param('id') id: string) {
    const deleted = await this.blobsService.deleteBlob(user.sub, id);
    return Ok({ data: { deleted } });
  }
}
