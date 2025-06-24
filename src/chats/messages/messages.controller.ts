import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';
import { MessagesService } from './messages.service';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  paginateMessages(
    @Param('cid', ParseIntPipe) id: number,
    @Query() dto: BasePaginationDto,
  ) {
    return this.messagesService.paginateMessages(dto, {
      where: { chat: { id } },
    });
  }
}
