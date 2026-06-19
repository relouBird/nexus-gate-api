import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthContext } from '../common/interfaces/auth-context.interface';
import { USERS_PATTERNS } from './users.constants';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** POST /auth/users — Crée un User dans la Team (CREATOR uniquement). */
  @MessagePattern(USERS_PATTERNS.USERS_CREATE)
  createMessage(@Payload() dto: CreateUserDto) {
    return this.usersService.createUserInTeam(dto);
  }

  /** DELETE /auth/users/:id — Supprime un User (CREATOR uniquement). */
  @MessagePattern(USERS_PATTERNS.USERS_DELETE)
  deleteMessage(@Payload() dto: DeleteUserDto) {
    return this.usersService.deleteUserInTeam(dto);
  }

  /** Bonus — GET /auth/users : liste des Users de la Team du requester. */
  @MessagePattern(USERS_PATTERNS.USERS_FIND_ALL)
  findAllMessage(@Payload() dto: { requester: AuthContext }) {
    return this.usersService.findUsersByTeam(dto.requester.teamId);
  }

  /** Bonus — GET /auth/users/:id : détail d'un User. */
  @MessagePattern(USERS_PATTERNS.USERS_FIND_ONE)
  findOneMessage(@Payload() dto: { id: string }) {
    return this.usersService.user({ id: dto.id });
  }
}
