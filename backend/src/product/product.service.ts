import {
  Injectable,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument, Review } from '../schemas/product.schema';
import { ClientSession, Model } from 'mongoose';
import { productQuery } from './dto/productQuery.dto';
import { Request } from 'express';
import {
  defaultPage,
  defaultLimit,
  Zero,
  maxOfPrice,
} from '../constant/common';
import { buildProductOptions, buildProductSort } from './utils/helper';
import { ProductDto, ProductUpdateDto } from './dto/product.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
  ) {}

  async getListProducts(req: Request) {
    try {
      const options: productQuery = {};
      let page = parseInt(req.query.page as any) || defaultPage;
      let limit = parseInt(req.query.limit as any) || defaultLimit;
      if (page < Zero) {
        page = defaultPage;
      }
      if (limit < Zero) {
        limit = defaultLimit;
      }
      if (req.query.productName) {
        options.productName = req.query.productName.toString();
      }

      let maxPrice: number;
      let minPrice: number;

      if (req.query.maxPrice) {
        maxPrice = parseInt(req.query.maxPrice as any) || maxOfPrice;
        options.maxPrice = maxPrice;
      }

      if (req.query.minPrice) {
        minPrice = parseInt(req.query.minPrice as any) || Zero;
        options.minPrice = minPrice;
      }

      if (minPrice > maxPrice) {
        throw Error('Max price cannot smaller than min price');
      }

      if (req.query.categories) {
        options.categories = req.query.categories.toString();
      }

      let orderBy = '';
      if (req.query.orderBy) {
        orderBy = req.query.orderBy.toString();
      }

      const products = await this.get(
        buildProductOptions(options),
        page,
        limit,
        buildProductSort(orderBy),
      );

      //   const minPrice = options.minPrice
      //     ? options.minPrice
      //     : await this.getPrice('priceAsc');
      //   const maxPrice = options.maxPrice
      //     ? options.maxPrice
      //     : await this.getPrice('priceDesc');
      //   const total = await this.count(options);

      //   return {
      //     data,
      //     total,
      //     page,
      //     last_page: Math.ceil(total / limit),
      //     minPrice,
      //     maxPrice,
      //   };
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async get(options: any, page?: number, limit?: number, sort?: any) {
    try {
      const products = await this.productModel
        .find(options)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .populate(['images', 'categories']);
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async productDetails(id: string) {
    try {
      const product = await this.productModel
        .findById(id)
        .populate(['images', 'categories']);
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  async createProduct(productDto: ProductDto) {
    try {
      for (let category of productDto.categories) {
        const categoryDetails = await this.categoryService.getCategoryByIds([
          category.id,
        ]);
        if (!categoryDetails) {
          throw new Error('Category is required');
        }
      }
      return (await this.productModel.create(productDto)).populate([
        'images',
        'categories',
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProduct(id: string, updateData: ProductUpdateDto) {
    try {
      return (
        await this.productModel.findByIdAndUpdate({ _id: id }, updateData, {
          new: true,
        })
      ).populate(['images', 'categories']);
    } catch (error) {
      console.log(error);
    }
  }

  async getProductById(
    productId: string,
    session?: ClientSession,
  ): Promise<Product> {
    let productQuery = this.productModel
      .findById(productId)
      .populate(['images', 'categories']);
    if (session) {
      productQuery = productQuery.session(session);
    }
    const product = await productQuery.exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
    return product;
  }

  async decrementProductQuantity(
    productId: string,
    quantityToDecrement: number,
    session?: ClientSession,
  ): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // Ensure there's enough quantity to decrement
    if (product.quantity < quantityToDecrement) {
      throw new Error(
        `Insufficient quantity for product with ID ${productId}.`,
      );
    }

    product.quantity -= quantityToDecrement;
    await product.save({ session });
  }

  // Add a review to a product
  async addReviewToProduct(
    productId: string,
    review: Review,
    options?: { session: ClientSession },
  ) {
    const session = options?.session;
    try {
      let product = await this.productModel.findById(productId, null, {
        session,
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      }
      // Calculate the average rating
      const totalRating = product.reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      );
      const overallRating =
        (totalRating + review.rating) / (product.reviews.length + 1);
      product.overallRating = overallRating;
      product.reviews.push(review);
      await product.save({ session });
      return product;
    } catch (error) {
      console.log(error);
    }
  }

  async similarProducts(options: any) {
    try {
      const products = await this.productModel
        .find(options)
        .limit(4)
        .populate(['images', 'categories']);
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
