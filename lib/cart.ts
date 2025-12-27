export function getCart() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function getCartCount() {
  return getCart().reduce((sum: number, i: any) => sum + i.quantity, 0);
}

export function saveCart(cart: any[]) {
  localStorage.setItem("cart", JSON.stringify(cart));

  window.dispatchEvent(new Event("cart_updated"));
}

export function addToCart(product: any) {
  const cart = getCart();

  const existing = cart.find((item: any) => item.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart(cart);
}
