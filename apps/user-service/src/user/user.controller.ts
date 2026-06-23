import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthContext } from '../common/interfaces/auth-context.interface';
import { USER_PATTERNS } from './user.constants';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  /** POST /auth/users — Crée un User dans la Team (CREATOR uniquement). */
  @MessagePattern(USER_PATTERNS.USERS_CREATE)
  createMessage(@Payload() dto: CreateUserDto) {
    return this.usersService.createUserInTeam(dto);
  }

  /** Bonus — GET /auth/users : liste des Users de la Team du requester. */
  @MessagePattern(USER_PATTERNS.USERS_FIND_ALL)
  updateUserMessage(@Payload() dto: { requester: AuthContext }) {
    return this.usersService.findUsersByTeam(dto.requester.teamId);
  }

  /** DELETE /auth/users/:id — Supprime un User (CREATOR uniquement). */
  @MessagePattern(USER_PATTERNS.USERS_DELETE)
  deleteMessage(@Payload() dto: DeleteUserDto) {
    return this.usersService.deleteUserInTeam(dto);
  }

  /** Bonus — GET /auth/users : liste des Users de la Team du requester. */
  @MessagePattern(USER_PATTERNS.USERS_FIND_ALL)
  findAllMessage(@Payload() dto: { requester: AuthContext }) {
    return this.usersService.findUsersByTeam(dto.requester.teamId);
  }

  /** Bonus — GET /auth/users/:id : détail d'un User. */
  @MessagePattern(USER_PATTERNS.USERS_FIND_ONE)
  findOneMessage(@Payload() dto: { id: string }) {
    return this.usersService.user({ id: dto.id });
  }
}
