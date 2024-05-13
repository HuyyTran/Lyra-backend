import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/createCart.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guards';
import { Roles } from '../guards/roles.decorator';
import { Request } from 'express';
import { UpdateCartDto } from './dto/updateCart.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartItem } from '../schemas/cart.schema';

@Controller('cart')
@ApiTags('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  orderService: any;
  constructor(private cartService: CartService) {}

  @Post('/createCart')
  @ApiBody({ type: CreateCartDto, description: 'The data for the new cart' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'The created cart', type: CartItem })
  @Roles('user')
  async createCart(
    @Body() createCartDto: CreateCartDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    createCartDto.userId = req.user.id;
    // Check if the product exists
    const cart = await this.cartService.getCartByProductIdNUserId(
      createCartDto.productId,
      req.user.id,
    );
    if (cart) {
      const updatedCart = await this.cartService.updateCart(
        cart._id,
        { quantity: cart.quantity + createCartDto.quantity },
        req.user.id,
      );
      return updatedCart;
    }
    return this.cartService.createCart(createCartDto);
  }

  @Patch('/updateCart/:id')
  @ApiParam({ name: 'id', description: 'The ID of the cart' })
  @ApiBody({ type: UpdateCartDto, description: 'The new data for the cart' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'The updated cart' })
  @Roles('user')
  async updateCart(
    @Body() updateCartDto: UpdateCartDto,
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.cartService.updateCart(id, updateCartDto, req.user.id);
  }

  @Get()
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'The ID of the user',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The carts of the user',
    type: [CartItem],
  })
  @Roles('user')
  async getAllCarts(@Req() req: Request & { user: { id: string } }) {
    return this.cartService.getCartsByUser(req.user.id);
  }
}
