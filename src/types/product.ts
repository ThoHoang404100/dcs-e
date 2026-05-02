import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

export type IProductTableFilters = {
  stock: string[];
  publish: string[];
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  postedAt: IDateValue;
  isPurchased: boolean;
  attachments?: string[];
};

export type IProductItem = {
  id: string;
  sku: string;
  name: string;
  code: string;
  price: number;
  taxes: number;
  tags: string[];
  sizes: string[];
  publish: string;
  gender: string[];
  coverUrl: string;
  images: string[];
  colors: string[];
  quantity: number;
  category: string;
  available: number;
  totalSold: number;
  description: string;
  totalRatings: number;
  totalReviews: number;
  createdAt: IDateValue;
  inventoryType: string;
  subDescription: string;
  priceSale: number | null;
  reviews: IProductReview[];
  newLabel: {
    content: string;
    enabled: boolean;
  };
  saleLabel: {
    content: string;
    enabled: boolean;
  };
  ratings: {
    name: string;
    starCount: number;
    reviewCount: number;
  }[];
};

export type ProductTableFilters = {
  Search: string;
  Filter: string;
}

export type ProductItem = {
  id: string;
  name: string;
  code: string;
  description: string;
  purchasePrice: number;
  price: number;
  unit: string;
  unitID: number;
  stock: number;
  warranty: number;
  createdDate: IDateValue;
  createBy: string;
  modified: IDateValue;
  modifiedBy: string;
  status: number;
  manufacturer: string;
  vat: number;
  image: string;
  category: string;
  categoryName: string;
  categoryId: number;
};

export type ProductListData = {
  pageNumber: number;
  pageSize: number;
  totalRecord: number;
  totalPages: number;
  allProduct: number;
  alMostOutOfStock: number;
  outOfStock: number;
  longTermInventory: number;
  items: ProductItem[];
};

export type ResProductList = {
  statusCode: number;
  message: string;
  data: ProductListData;
};

export type ProductDto = {
  name: string;
  description: string;
  code: string;
  image: string | null;
  moreImages?: string[] | null;
  purchasePrice: number;
  price: number;
  priceList?: number | 0;
  stock: number;
  unitId: number;
  warranty: number;
  manufacturer: string;
  vat: number;
  categoryId: number;
}

export type ResProductItem = {
  statusCode: number;
  message: string;
  data: ProductItem;
}