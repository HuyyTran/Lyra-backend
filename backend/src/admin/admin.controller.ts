import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CategoryService } from '../category/category.service';
import { ImageService } from '../image/image.service';
import { ProductService } from '../product/product.service';
import { Zero, invalidPrice, invalidQuantity } from '../constant/common';
import { RolesGuard } from '../guards/roles.guards';
import { Roles } from '../guards/roles.decorator';
import { JwtAuthGuard } from '../auth/auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoryDetails, CategoryDto } from '../category/dto/category.dto';
import { ProductDto } from '../product/dto/product.dto';
import { OrderService } from '../order/order.service';
import { BlogService } from '../blog/blog.service';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private orderService: OrderService,
    private blogService: BlogService,
  ) {}

  @Post('createProduct')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBearerAuth()
  @ApiBody({
    type: ProductDto,
    description: 'Product data',
    required: true,
  })
  @ApiBody({
    description: 'Product data',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string', description: 'Name of the product' },
        price: { type: 'number', description: 'Price of the product' },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Categories of the product',
        },
        description: {
          type: 'string',
          description: 'Description of the product',
        },
        shortDescription: {
          type: 'string',
          description: 'Short description of the product',
        },
        productSKU: { type: 'string', description: 'SKU of the product' },
        additionalInfos: {
          type: 'string',
          description: 'Additional information about the product',
        },
        quantity: { type: 'number', description: 'Quantity of the product' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images of the product',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
    type: ProductDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to create the product',
  })
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const newProduct: any = {
      productName: req.body.productName,
      price: parseFloat(req.body.price),
      categories: req.body.categories,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      productSKU: req.body.productSKU,
      additionalInfos: req.body.additionalInfos,
      quantity: req.body.quantity,
    };
    const fileList = await this.imageService.uploadImages(files);
    // ** Save images url to our mongoDB collections
    let imgs = [];
    for (let i = Zero; i < fileList.length; i++) {
      const img = fileList[i];
      const image = await this.imageService.createImage(img);
      imgs.push(image.id);
    }
    // ** Get array of image's id and add to our product
    newProduct.images = imgs;
    const product = await this.productService.createProduct(newProduct);
    if (!product) {
      throw new HttpException(
        'Failed to create new product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return product;
  }

  @Post('createCategory')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CategoryDetails })
  async createCatetory(@Req() req: Request) {
    const newCategory: any = {
      name: req.body.name,
    };

    const category = await this.categoryService.createCategory(newCategory);
    if (!category) {
      throw new HttpException(
        'Failed to create new category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return category;
  }

  @Patch('updateProduct/:id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the product to update',
  })
  @ApiBody({
    type: 'object',
    description: 'Product data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', description: 'New price of the product' },
        quantity: {
          type: 'number',
          description: 'New quantity of the product',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'The product has been successfully updated.',
    type: ProductDto,
  })
  @ApiBadRequestResponse({ description: 'Price or quantity is invalid' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update the product',
  })
  async updateProduct(@Req() req: Request, @Param('id') id: string) {
    let product: any = {};
    if (req.body.price) {
      product.price = parseInt(req.body.price as any) || invalidPrice;
      if (product.price < Zero) {
        throw new HttpException('Price is invalid', HttpStatus.BAD_REQUEST);
      }
    }
    if (req.body.quantity) {
      product.quantity = parseInt(req.body.quantity as any) || invalidQuantity;
      if (product.quantity < Zero) {
        throw new HttpException('Quantity is invalid', HttpStatus.BAD_REQUEST);
      }
    }

    const productUpdate = await this.productService.updateProduct(id, product);
    if (!productUpdate) {
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return productUpdate;
  }

  @Patch('updateCategory/:id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the category to update',
  })
  @ApiBody({
    type: 'object',
    description: 'Category data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'New name of the category' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The category has been successfully updated.',
    type: CategoryDto,
  })
  @ApiBadRequestResponse({ description: 'Name is invalid' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update the category',
  })
  async updateCategory(@Req() req: Request, @Param('id') id: string) {
    let category: any = {};
    if (req.body.name) {
      category.name = String(req.body.name as any) || '';
      if (category.name.length == 0) {
        throw new HttpException('Name is invalid', HttpStatus.BAD_REQUEST);
      }
    }

    const categoryUpdate = await this.categoryService.updateCategory(
      id,
      category,
    );
    if (!categoryUpdate) {
      throw new HttpException(
        'Failed to update category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return categoryUpdate;
  }

  // Get all orders for admin (can filter by status if does not pass order status, return all orders)
  @Get('orders')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({
    description: 'The orders have been successfully retrieved.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Status of the orders to retrieve',
  })
  @ApiBadRequestResponse({ description: 'Status is invalid' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the orders',
  })
  async getOrders(@Req() req: Request, @Query('status') status: string) {
    let orders;
    if (status == undefined || status == 'null' || status == '') {
      orders = await this.orderService.getOrders();
    } else {
      orders = await this.orderService.getOrdersByStatus(status);
    }
    if (!orders) {
      throw new HttpException(
        'Failed to retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return orders;
  }

  // Update order status by id
  @Patch('updateOrderStatus/:id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the order to update',
  })
  @ApiBody({
    type: 'object',
    description: 'Order data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'New status of the order',
          enum: [
            'pending',
            'confirmed',
            'delivering',
            'delivered',
            'cancelled',
          ],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'The order status has been successfully updated.',
  })
  @ApiBadRequestResponse({ description: 'Status is invalid' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update the order status',
  })
  async updateOrderStatus(@Req() req: Request, @Param('id') id: string) {
    const status = String(req.body.status as any) || '';
    if (
      status != 'pending' &&
      status != 'confirmed' &&
      status != 'delivering' &&
      status != 'delivered' &&
      status != 'cancelled'
    ) {
      throw new HttpException('Status is invalid', HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.BAD_REQUEST);
    }

    const orderUpdate = await this.orderService.updateOrderStatus(
      id,
      order.status,
      status,
    );
    if (!orderUpdate) {
      throw new HttpException(
        'Failed to update order status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Order status has been successfully updated' };
  }

  // Get dashboard for admin including total orders in the specify time range, total revenue and the number of order based on status
  @Get('dashboard')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiOkResponse({
    description: 'The dashboard has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        totalOrders: {
          type: 'number',
          description: 'Total number of orders in the specified time range.',
        },
        totalOrdersBasedOnDay: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                format: 'date',
                description: 'Date of the orders.',
              },
              count: {
                type: 'number',
                description: 'Number of orders on the date.',
              },
            },
          },
          description:
            'Number of orders grouped by date in the specified time range.',
        },
        totalOrdersBasedOnStatus: {
          type: 'object',
          additionalProperties: {
            type: 'number',
          },
          description:
            'Number of orders grouped by status in the specified time range.',
        },
        totalRevenue: {
          type: 'number',
          description: 'Total revenue in the specified time range.',
        },
        topProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productName: {
                type: 'string',
                description: 'Name of the product.',
              },
              quantity: {
                type: 'number',
                description: 'Number of times the product was ordered.',
              },
            },
          },
          description: 'Top selling products in the specified time range.',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the dashboard',
  })
  async getDashboard(
    @Req() req: Request,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const totalOrders = await this.orderService.getTotalOrderForDashBoard(
      startDate,
      endDate,
    );

    const totalOrdersBasedOnDay =
      await this.orderService.getOrdersGroupByDateForDashboard(
        startDate,
        endDate,
      );

    const totalOrdersBasedOnStatus =
      await this.orderService.getOrdersGroupByStatusForDashboard(
        startDate,
        endDate,
      );

    const totalRevenue = await this.orderService.getTotalRevenue(
      startDate,
      endDate,
    );

    const topProducts = await this.orderService.getTopSellingProducts(
      startDate,
      endDate,
    );

    return {
      totalOrders,
      totalOrdersBasedOnDay,
      totalOrdersBasedOnStatus,
      totalRevenue,
      topProducts,
    };
  }

  // Create a blog
  @Post('createBlog')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a blog' })
  @ApiBody({
    type: 'object',
    description: 'Blog data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the blog' },
        content: { type: 'string', description: 'Content of the blog' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'The blog has been successfully created.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to create the blog',
  })
  async createBlog(@Req() req: Request & { user: { id: string } }) {
    const newBlog: any = {
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
    };

    const blog = await this.blogService.createBlog(newBlog);
    if (!blog) {
      throw new HttpException(
        'Failed to create new blog',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return blog;
  }

  // Update blog by id
  @Patch('updateBlog/:id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the blog to update',
  })
  @ApiBody({
    type: 'object',
    description: 'Blog data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'New title of the blog' },
        content: { type: 'string', description: 'New content of the blog' },
      },
    },
  })
  @ApiOkResponse({
    description: 'The blog has been successfully updated.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to update the blog',
  })
  async updateBlog(@Req() req: Request, @Param('id') id: string) {
    let blog: any = {};
    if (req.body.title) {
      blog.title = String(req.body.title as any) || '';
    }
    if (req.body.content) {
      blog.content = String(req.body.content as any) || '';
    }

    const blogUpdate = await this.blogService.updateBlog(id, blog);
    if (!blogUpdate) {
      throw new HttpException(
        'Failed to update blog',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return blogUpdate;
  }
}
