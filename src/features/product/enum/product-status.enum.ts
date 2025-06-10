enum ProductStatusEnum {
  ACTIVE = 0,
  INACTIVE = 1,
}

export const getProductStatusEnumLabel = (productStatus: ProductStatusEnum) => {
  switch (productStatus) {
    case ProductStatusEnum.ACTIVE:
      return 'Active';
    case ProductStatusEnum.INACTIVE:
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

export const getProductStatusEnums = () => {
  const enums = Object.entries(ProductStatusEnum);
  const result: { id: ProductStatusEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value as ProductStatusEnum,
        name: getProductStatusEnumLabel(+value),
      });
    }
  }

  return result;
};

export default ProductStatusEnum;
