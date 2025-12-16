/* Product Utilities - GoBuy v21 */

// Generate colored SVG placeholder images
function generateProductImage(text, color) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23${color}' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${encodeURIComponent(
    text
  )}%3C/text%3E%3C/svg%3E`;
}
