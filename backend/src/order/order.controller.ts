import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guards';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from '../schemas/order.schema';

@Controller('order')
@ApiTags('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/createOrder')
  @ApiBody({ type: CreateOrderDto, description: 'The data for the new order' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'The created order' })
  @ApiOkResponse({
    description: 'The created order records',
    type: Order,
  })
  @UsePipes(ValidationPipe)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    createOrderDto.user = req.user.id;
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'The status of the orders to retrieve',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The orders for the authenticated user',
    type: [Order],
  })
  async getOrders(@Req() req: Request & { user: { id: string } }) {
    return this.orderService.getOrdersByUser(
      req.user.id,
      req.query.status as any,
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'The ID of the order' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The order with the given ID',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.orderService.getOrderByIdNUserId(id, req.user.id);
  }

  // API to cancel an order
  @Patch('/cancelOrder/:id')
  @ApiParam({ name: 'id', description: 'The ID of the order to cancel' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiOkResponse({
    description: 'The order has been successfully cancelled.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Order has been successfully cancelled',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid order ID' })
  @ApiInternalServerErrorResponse({ description: 'Failed to cancel the order' })
  async cancelOrder(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    const order = await this.orderService.getOrderByIdNUserId(id, req.user.id);
    if (order.status === 'cancelled') {
      throw new ForbiddenException('This order has already been cancelled');
    }
    if (order.status === 'delivered' || order.status === 'delivering') {
      throw new ForbiddenException(
        'This order has already been delivering or delivered',
      );
    }
    if (order.status === 'confirmed' && order.payment.paymentMethod !== 'COD') {
      throw new ForbiddenException(
        'This order has already been confirmed and paid for',
      );
    }
    const updateOrder = this.orderService.updateOrderStatus(
      id,
      order.status,
      'cancelled',
      req.user.id,
    );
    if (!updateOrder) {
      throw new ForbiddenException('Failed to cancel the order');
    }
    return { message: 'Order has been successfully cancelled' };
  }

  // API to add a review to the product
  @Patch('/addReview/:id')
  @ApiParam({ name: 'id', description: 'The ID of the order' })
  @ApiBody({
    description: 'The review to be added to the product',
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'The ID of the product' },
        comment: { type: 'string', description: 'The comment of the review' },
        rating: { type: 'number', description: 'The rating of the review' },
      },
      required: ['productId', 'comment', 'rating'],
    },
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a review to a product' })
  @ApiOkResponse({
    description: 'The review has been successfully added.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Review has been added successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid order ID or review data' })
  @ApiInternalServerErrorResponse({ description: 'Failed to add the review' })
  async addReviewToProduct(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { productId: string; comment: string; rating: number },
  ) {
    const product = this.orderService.addReviewToProduct(
      id,
      req.user.id,
      body.productId,
      body.comment,
      body.rating,
    );
    if (!product) {
      throw new ForbiddenException('Failed to add review to the product');
    }
    return { message: 'Review has been added successfully' };
  }
}
