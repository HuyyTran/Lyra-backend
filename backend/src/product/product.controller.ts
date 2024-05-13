import {
  Controller,
  Get,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductService } from './product.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of products' })
  @ApiQuery({ name: 'productName', type: String, required: false })
  @ApiQuery({
    name: 'categories',
    type: String,
    description: 'ObjectId of category',
    required: false,
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    enum: ['priceAsc', 'priceDesc', 'lastest'],
    required: false,
  })
  @ApiOkResponse({
    description: 'The list of product has been successfully retrieved.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The ID of the product.',
          },
          name: {
            type: 'string',
            description: 'The name of the product.',
          },
          price: {
            type: 'number',
            description: 'The price of the product.',
          },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL of the image.',
                },
                image_name: {
                  type: 'string',
                  description: 'The name of the image.',
                },
              },
            },
            description: 'Array of images associated with the product.',
          },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the category.',
                },
              },
            },
            description: 'Array of categories the product belongs to.',
          },
          reviews: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rating: {
                  type: 'number',
                  description: 'The rating of the review.',
                },
                comment: {
                  type: 'string',
                  description: 'The comment of the review.',
                },
              },
            },
            description: 'Array of reviews for the product.',
          },
          overallRating: {
            type: 'number',
            description: 'The overall rating of the product.',
          },
        },
        description: 'Details of the product.',
      },
      description: 'List of products',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the list of products',
  })
  async products(@Req() req: Request) {
    return this.productService.getListProducts(req);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'The ID of the product' })
  @ApiOperation({ summary: 'Get product details' })
  @ApiOkResponse({
    description: 'The product details have been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        productDetail: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the product.',
            },
            name: {
              type: 'string',
              description: 'The name of the product.',
            },
            price: {
              type: 'number',
              description: 'The price of the product.',
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'The URL of the image.',
                  },
                  image_name: {
                    type: 'string',
                    description: 'The name of the image.',
                  },
                },
              },
              description: 'Array of images associated with the product.',
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the category.',
                  },
                },
              },
              description: 'Array of categories the product belongs to.',
            },
            reviews: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rating: {
                    type: 'number',
                    description: 'The rating of the review.',
                  },
                  comment: {
                    type: 'string',
                    description: 'The comment of the review.',
                  },
                },
              },
              description: 'Array of reviews for the product.',
            },
            overallRating: {
              type: 'number',
              description: 'The overall rating of the product.',
            },
          },
          description: 'Details of the product.',
        },
        similarProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the similar product.',
              },
              name: {
                type: 'string',
                description: 'The name of the similar product.',
              },
              price: {
                type: 'number',
                description: 'The price of the similar product.',
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the category.',
                    },
                  },
                },
                description:
                  'Array of categories the similar product belongs to.',
              },
              images: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'The URL of the image.',
                    },
                    image_name: {
                      type: 'string',
                      description: 'The name of the image.',
                    },
                  },
                },
                description:
                  'Array of images associated with the similar product.',
              },
              reviews: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rating: {
                      type: 'number',
                      description: 'The rating of the review.',
                    },
                    comment: {
                      type: 'string',
                      description: 'The comment of the review.',
                    },
                  },
                },
                description: 'Array of reviews for the similar product.',
              },
              overallRating: {
                type: 'number',
                description: 'The overall rating of the similar product.',
              },
            },
          },
          description: 'Array of similar products.',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Product is not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the product details',
  })
  async productDetail(@Param('id') id: string) {
    const productDetail = await this.productService.productDetails(id);
    const categories = productDetail.categories[0];
    const similarProducts = await this.productService.similarProducts({
      categories: categories,
    });

    if (!productDetail) {
      throw new HttpException('Product is not found', HttpStatus.BAD_REQUEST);
    }

    return {
      productDetail: {
        ...productDetail['_doc'],
        // similarProducts: similarProducts,
      },
      similarProducts: similarProducts,
    };
  }
}
