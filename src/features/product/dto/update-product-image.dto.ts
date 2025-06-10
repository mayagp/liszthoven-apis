export class UpdateProductImageDto {
  product_images: Array<{
    id: number;
    sequence: number;
    is_default: boolean;
  }>;
}
