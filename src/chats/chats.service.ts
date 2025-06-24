import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { PaginateChatDto } from './dto/paginate-chat.dto';
import { ChatsModel } from './entity/chats.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      // 만약 userIds가 1, 2, 3 이라면, [{id: 1}, {id: 2}, {id: 3}] 형식으로 넣어 줌.
      users: dto.userIds.map((id) => ({ id: id })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: { users: true }, // 연관되어 있는 users도 같이 가져오기
      },
      'chats',
    );
  }

  async checkIfChatExists(chatId: number) {
    const exist = await this.chatsRepository.findOne({
      where: {
        id: chatId,
      },
    });

    return exist;
  }
}
