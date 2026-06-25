import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { USER_PATTERNS } from './user.constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** POST /users — Crée un User dans la Team (CREATOR uniquement). */
  @MessagePattern(USER_PATTERNS.USERS_CREATE)
  createMessage(@Payload() dto: CreateUserDto) {
    return this.userService.createUserInTeam(dto);
  }

  /** Bonus — GET /users : liste des Users de la Team du requester. */
  @MessagePattern(USER_PATTERNS.USERS_FIND_ALL)
  findAllMessage(@Payload() dto: GetUsersDto) {
    return this.userService.findUsersByTeam(dto);
  }

  /** Bonus — GET /users/:id : détail d'un User. */
  @MessagePattern(USER_PATTERNS.USERS_FIND_ONE)
  findOneMessage(@Payload() dto: GetUserDto) {
    return this.userService.findOneUserByTeam(dto);
  }

  /** Bonus — UPDATE /users : Mets à jour un User de la Team */
  @MessagePattern(USER_PATTERNS.USERS_UPDATE)
  updateUserMessage(@Payload() dto: UpdateUserDto) {
    return this.userService.updateUserByTeam(dto);
  }

  /** DELETE /users/:id — Supprime un User (CREATOR uniquement). */
  @MessagePattern(USER_PATTERNS.USERS_DELETE)
  deleteMessage(@Payload() dto: DeleteUserDto) {
    return this.userService.deleteUserInTeam(dto);
  }
}
