export const POWDER_CATEGORIES = [
  'Milk Tea Powder',
  'Milk Foam Powder',
  'Fruit Juice Powder',
  'Beverage Flavor Powder',
  'Soft Ice Cream Powder',
  'Milkshake Powder',
  'Smoothie Powder',
  'Snow Ice Powder',
  'Pudding Powder',
  'Jelly Powder',
  'Cookie Crumbles',
  'Premix Powder',
  'Waffling Powder',
  'Tiger Powder'
];

export function getProductCategory(product) {
  const category = String(product.category || '').trim().toLowerCase();
  const title = String(product.title || '').trim().toLowerCase();

  return POWDER_CATEGORIES.find(
    (item) => item.toLowerCase() === category || item.toLowerCase() === title
  ) || 'Powder Products';
}

export function getProductFlavour(product) {
  return String(product.flavour || product.flavor || '').trim();
}

export function getProductPackage(product) {
  const packageFromSizeList = String(product.sizes || '').trim();
  const containsPackageUnit = /\b\d+(?:\.\d+)?\s?(?:kg|g|ml|l)\b/i.test(
    packageFromSizeList
  );

  return String(
    product.package_specification ||
    product.packageSpecification ||
    (getProductCategory(product) !== 'Powder Products' && containsPackageUnit
      ? packageFromSizeList
      : '') ||
    ''
  ).trim();
}

export function getProductCarton(product) {
  return String(
    product.carton_packaging ||
    product.cartonPackaging ||
    ''
  ).trim();
}

export function getProductShelfLife(product) {
  return String(product.shelf_life || product.shelfLife || '').trim();
}
