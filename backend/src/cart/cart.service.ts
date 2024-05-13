import {
  Injectable,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CartItem, CartItemDocument } from '../schemas/cart.schema';
import { CreateCartDto } from './dto/createCart.dto';
import { ProductService } from '../product/product.service';
import { UpdateCartDto } from './dto/updateCart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem.name)
    private cartModel: Model<CartItemDocument>,
    private productService: ProductService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  async createCart(createCart: CreateCartDto) {
    try {
      const product = await this.productService.getProductById(
        createCart.productId,
      );
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createCart.productId} not found.`,
        );
      }
      const cart = await this.cartModel.create({
        product: createCart.productId,
        quantity: createCart.quantity,
        user: createCart.userId,
      });
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  async getCartById(id: string) {
    try {
      const cart = await this.cartModel.findById(id);
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  async getCartByIdNUserId(
    id: String,
    userId: String,
    session?: ClientSession,
  ) {
    try {
      let cartQuery = this.cartModel.findById({ _id: id, user: userId });
      if (session) {
        cartQuery = cartQuery.session(session);
      }
      const cart = await cartQuery.exec();
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  async getCartsByUser(userId: string) {
    try {
      const carts = await this.cartModel.find({ user: userId });
      return carts;
    } catch (error) {
      console.log(error);
    }
  }

  async updateCart(id: String, updateCart: UpdateCartDto, userId: string) {
    try {
      const cart = await this.cartModel.findByIdAndUpdate(
        { _id: id, user: userId },
        updateCart,
        { new: true },
      );
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCartByIdNUserId(id: String, userId: string) {
    try {
      const cart = await this.cartModel.findOneAndDelete({
        _id: id,
        user: userId,
      });
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will return cart by product ID and user ID
  async getCartByProductIdNUserId(productId: string, userId: string) {
    try {
      const cart = await this.cartModel.findOne({
        product: productId,
        user: userId,
      });
      return cart;
    } catch (error) {
      console.log(error);
    }
  }

  // This method will update quantity of the cart
  async updateQuantity(id: string, quantity: number, userId: string) {
    try {
      const cart = await this.cartModel.findOneAndUpdate(
        { _id: id, user: userId },
        { quantity: quantity },
        { new: true },
      );
      return cart;
    } catch (error) {
      console.log(error);
    }
  }
}
