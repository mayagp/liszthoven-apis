const EnumListHelper = (enumObj: any) => {
  return Object.entries(enumObj)
    .splice(Object.keys(enumObj).length / 2)
    .map((value) => {
      return {
        id: value[1],
        name: EnumKeyReadableHelper(enumObj, value[1]),
      };
    });
};

const EnumArrayHelper = (enumObj: any) => {
  return Object.entries(enumObj)
    .splice(Object.keys(enumObj).length / 2)
    .map((value) => {
      return value[1];
    });
};

const EnumKeyReadableHelper = (enumObj: any, value: any) => {
  return Object.keys(enumObj)
    [Object.values(enumObj).indexOf(value)].replace(/_/g, ' ')
    .toLocaleUpperCase();
};

export { EnumListHelper, EnumArrayHelper, EnumKeyReadableHelper };

// type EnumList = { id: string | number; name: string };

// // Convert an enum to an array of objects with `id` and `name` properties.
// export const EnumListHelper = (enumObj: Record<string, string | number>): EnumList[] => {
//   return Object.entries(enumObj)
//     .filter((_, index) => Number.isNaN(Number(enumObj[index])))
//     .map(([key, value]) => ({
//       id: value,
//       name: EnumKeyReadableHelper(enumObj, value),
//     }));
// };

// // Convert an enum to an array of its values.
// export const EnumArrayHelper = (enumObj: Record<string, string | number>): (string | number)[] => {
//   return Object.values(enumObj).filter((value) => Number.isNaN(Number(value)));
// };

// // Make the key of an enum more readable.
// export const EnumKeyReadableHelper = (enumObj: Record<string, string | number>, value: string | number): string => {
//   return Object.keys(enumObj)
//     .find((key) => enumObj[key] === value)
//     ?.replace(/_/g, ' ')
//     .toLocaleUpperCase() ?? '';
// };
