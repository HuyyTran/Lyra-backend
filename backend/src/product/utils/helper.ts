import mongoose from 'mongoose';
import { productQuery } from '../dto/productQuery.dto';
import { productSort } from '../dto/productSort.dto';

export function buildProductOptions(requestOptions: productQuery) {
  // empty options => return empty json
  if (!requestOptions) {
    return {};
  }

  const { productName, maxPrice, minPrice, categories } = requestOptions;

  const options: any = {};
  if (productName) {
    options.productName = new RegExp(productName, 'i');
  }

  if (maxPrice && minPrice) {
    options.price = { $gte: minPrice, $lte: maxPrice };
  } else {
    if (maxPrice) {
      options.price = { $lte: maxPrice };
    }
    if (minPrice) {
      options.price = { $gte: minPrice };
    }
  }

  if (categories) {
    options.categories = new mongoose.Types.ObjectId(categories);
  }

  return { ...options };
}

export function buildProductSort(orderBy: string) {
  if (orderBy == '') {
    return {};
  }

  const sort: productSort = {};
  switch (orderBy) {
    case 'priceAsc':
      sort.price = 1;
      break;
    case 'priceDesc':
      sort.price = -1;
      break;
    case 'lastest':
      sort.createdAt = 1;
      break;
  }
  return { ...sort };
}
