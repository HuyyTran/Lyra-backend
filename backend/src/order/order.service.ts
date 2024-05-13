import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { OrderDocument, Order, OrderItem } from '../schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Review } from '../schemas/product.schema';

// create a enum to make sure that the status is one of the following and does not update reserverd status
enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Delivering = 'delivering',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

@Injectable()
export class OrderService {
  private orderStatusSequence = [
    OrderStatus.Pending,
    OrderStatus.Confirmed,
    OrderStatus.Delivering,
    OrderStatus.Delivered,
    OrderStatus.Cancelled,
  ];
  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private userService: UserService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(createOrderDto: CreateOrderDto) {
    const session = await this.orderModel.db.startSession();
    let productInfos = [];
    session.startTransaction();
    try {
      let totalPrice = 0;
      let orderItems: OrderItem[] = [];
      for (let cartId of createOrderDto.cartItems) {
        const cart = await this.cartService.getCartByIdNUserId(
          cartId,
          createOrderDto.user,
          session,
        );

        if (!cart) {
          throw new NotFoundException(`Cart with ID ${cartId} not found.`);
        }
        const product = await this.productService.getProductById(
          cart.product,
          session,
        );
        productInfos.push(product);
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${cart.product} not found.`,
          );
        }
        if (cart.quantity > product.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.productName}.`,
          );
        }
        await this.productService.decrementProductQuantity(
          cart.product,
          cart.quantity,
          session,
        );
        await this.cartService.deleteCartByIdNUserId(
          cartId,
          createOrderDto.user,
        );
        totalPrice += product.price * cart.quantity;
        orderItems.push({
          productId: cart.product,
          quantity: cart.quantity,
          isReviewed: false,
        });
      }
      const orderData = {
        user: createOrderDto.user,
        orderItems: orderItems,
        payment: createOrderDto.payment,
        totalPrice: totalPrice + createOrderDto.shippingFee,
        deliveryInfo: createOrderDto.deliveryInfo,
        shippingFee: createOrderDto.shippingFee,
        status: 'pending',
      };
      if (orderData.payment.paymentMethod === 'COD') {
        orderData.status = 'confirmed';
      }

      const order = new this.orderModel(orderData);
      order.$session(session);
      const createdOrder = await order.save();
      const user = await this.userService.getUserById(createOrderDto.user);
      await this.notificationService.sendOrderConfirmationEmail(
        createdOrder,
        productInfos,
        user,
      );
      await session.commitTransaction();
      return createdOrder;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  private isValidStatus(currentStatus: string, newStatus: string): boolean {
    const currentStatusIndex = this.orderStatusSequence.indexOf(
      currentStatus as any,
    );
    const newStatusIndex = this.orderStatusSequence.indexOf(newStatus as any);

    if (currentStatusIndex === -1 || newStatusIndex === -1) {
      return false;
    }

    return newStatusIndex > currentStatusIndex;
  }
  // Update status and check if status is valid and do not update reserved status
  async updateOrderStatus(
    orderId: string,
    currentStatus: string,
    newStatus: string,
    userId?: string,
  ) {
    try {
      if (!this.isValidStatus(currentStatus, newStatus)) {
        throw new Error('Invalid or reserved order status');
      }

      let order: OrderDocument;
      if (userId) {
        order = await this.orderModel.findById({
          _id: orderId,
          userId: userId,
        });
      } else {
        order = await this.orderModel.findById(orderId);
      }
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = newStatus;
      return await order.save();
    } catch (error) {
      console.log(error);
    }
  }

  // This method will change status of order to 'confirmed' and update transactionId
  async updatePaymentTransactionId(orderId: string, transactionId: string) {
    try {
      const order = await this.orderModel.findByIdAndUpdate(
        { _id: orderId },
        { 'payment.transactionId': transactionId, status: 'confirmed' },
        { new: true },
      );
      return order;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will update isReviewed field of orderItem to true
  async updateOrderItemReviewStatus(
    orderId: string,
    userId: string,
    productId: string,
    session?: ClientSession,
  ) {
    try {
      const order = await this.orderModel.findOne(
        {
          _id: orderId,
          user: userId,
        },
        null,
        { session },
      );

      if (!order) {
        console.log('Order not found');
        return;
      }

      if (order.status !== 'delivered') {
        console.log('Order not delivered');
        return;
      }

      let isReviewed = false;
      order.orderItems.forEach((item) => {
        if (item.productId.toString() === productId && !item.isReviewed) {
          item.isReviewed = true;
          isReviewed = true;
        }
      });

      if (!isReviewed) {
        return null;
      }

      order.markModified('orderItems');
      const updatedOrder = await order.save({ session });
      return updatedOrder;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return list of orders of user and other filter options
  async getOrdersByUser(userId: string, status?: string) {
    try {
      const orders = await this.orderModel
        .find({ user: userId, ...(status && { status: status }) })
        .sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return order by ID
  async getOrderById(orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId);
      return order;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return order by ID
  async getOrderByIdNUserId(orderId: string, userId: string) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
        user: userId,
      });
      return order;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return list of orders
  async getOrders() {
    try {
      const orders = await this.orderModel.find().sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return list of orders by status
  async getOrdersByStatus(status: string) {
    try {
      const orders = await this.orderModel.find({ status: status });
      return orders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will update isReviewed field to true and add a review to product
  async addReviewToProduct(
    orderId: string,
    userId: string,
    productId: string,
    comment: string,
    rating: number,
  ) {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();
    try {
      const order = await this.updateOrderItemReviewStatus(
        orderId,
        userId,
        productId,
        session,
      );
      if (!order) {
        throw new NotFoundException(
          `Order with ID ${orderId} not found or product with ID ${productId} not found or had reviewed.`,
        );
      }
      const reviewData: Review = {
        user: userId,
        comment: comment,
        rating: rating,
      };

      const product = await this.productService.addReviewToProduct(
        productId,
        reviewData,
        { session },
      );
      await session.commitTransaction();
      return product;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // This method will return for the dashboard of admin with total orders in a specific time period
  async getTotalOrderForDashBoard(from: string, to: string) {
    try {
      const numberOfOrders = await this.orderModel.countDocuments({
        createdAt: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
      });
      return numberOfOrders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return for the dashboard of admin that the number of orders on each day in a specific time period
  async getOrdersGroupByDateForDashboard(from: string, to: string) {
    try {
      const orders = await this.orderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(from),
              $lt: new Date(to),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]);
      return orders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return for the dashboard of admin with total orders group by status in a specific time period
  async getOrdersGroupByStatusForDashboard(from: string, to: string) {
    try {
      const orders = await this.orderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(from),
              $lt: new Date(to),
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
      return orders;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will calculate the tollal revenue in a specific time period
  async getTotalRevenue(from: string, to: string) {
    try {
      const orders = await this.orderModel
        .find({
          createdAt: {
            $gte: new Date(from),
            $lt: new Date(to),
          },
        })
        .sort({ createdAt: -1 });
      let totalRevenue = 0;
      orders.forEach((order) => {
        totalRevenue += order.totalPrice;
      });
      return totalRevenue;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return a top 10 best selling products in a specific time period
  async getTopSellingProducts(from: string, to: string) {
    try {
      const orders = await this.orderModel
        .find({
          createdAt: {
            $gte: new Date(from),
            $lt: new Date(to),
          },
        })
        .sort({ createdAt: -1 });
      let products = {};
      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          if (products[item.productId]) {
            products[item.productId] += item.quantity;
          } else {
            products[item.productId] = item.quantity;
          }
        });
      });
      let topProducts = Object.keys(products)
        .sort((a, b) => products[b] - products[a])
        .slice(0, 10);
      const topProductsWithNameNQtys = await Promise.all(
        topProducts.map(async (product) => {
          const productDetails =
            await this.productService.getProductById(product);
          return {
            productName: productDetails.productName,
            quantity: products[product],
          };
        }),
      );
      return topProductsWithNameNQtys;
    } catch (error) {
      console.log(error);
    }
  }
}
