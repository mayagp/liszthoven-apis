export class CreateProductDto {
  name: string;
  description: string;
  type: number;
  base_price: number;
  status: number;
  uom: string;
  minimal_stock_level: number;
  valuation_method: number;
  product_category_id: number;
  brand_id: number;
  product_images: Array<{
    url: string;
    file_path: string;
    file_type: string;
    is_default: string | boolean;
    file: any;
    sequence: number;
  }>;
}
