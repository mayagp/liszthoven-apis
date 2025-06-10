enum ProductTypeEnum {
  SERIALIZED = 0,
  NONSERIALIZED = 1,
}

export const getProductTypeEnumLabel = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.SERIALIZED:
      return 'Serialized';
    case ProductTypeEnum.NONSERIALIZED:
      return 'Non serialized';
    default:
      return 'Unknown';
  }
};

export const getProductTypeEnums = () => {
  const enums = Object.entries(ProductTypeEnum);
  const result: { id: ProductTypeEnum; name: string }[] = [];

  for (const [key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getProductTypeEnumLabel(+value),
      });
    }
  }

  return result;
};

export default ProductTypeEnum;
