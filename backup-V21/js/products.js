/* Product Database - GoBuy v21 - Main Loader */

async function fetchProductsFromAPI() {
  await new Promise((r) => setTimeout(r, 500));

  // Combine all category products
  return [
    ...electronicsProducts,
    ...kitchenProducts,
    ...sportsProducts,
    ...homeProducts,
    ...fashionProducts,
    ...toysProducts,
    ...beautyProducts,
    ...gardenProducts,
    ...automotiveProducts,
    ...babyProducts,
  ];
}
