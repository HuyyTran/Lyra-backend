import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guards';

@Controller('user')
@ApiTags('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('updateProfile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    description: 'User profile data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'New email of the user' },
        firstName: {
          type: 'string',
          description: 'New first name of the user',
        },
        lastName: { type: 'string', description: 'New last name of the user' },
        oldPassword: {
          type: 'string',
          description: 'Old password of the user',
        },
        password: { type: 'string', description: 'New password of the user' },
      },
      required: ['oldPassword'],
    },
  })
  @ApiOkResponse({
    description: 'The user profile has been successfully updated.',
  })
  @ApiBadRequestResponse({
    description:
      'Email, first name, last name, old password, or new password is invalid',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update the user profile',
  })
  @ApiBearerAuth()
  @Patch('updateProfile')
  async updateProfile(
    @Body()
    body: {
      email: string;
      firstName: string;
      lastName: string;
      oldPassword: string;
      password: string;
    },
    @Req() req: Request & { user: { id: string } },
  ) {
    const userId = req.user.id;
    const user = await this.userService.updateUser(userId, body);
    return {};
  }
}
