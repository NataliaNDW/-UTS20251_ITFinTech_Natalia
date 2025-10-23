// Keranjang belanja dengan localStorage
export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

export function addToCart(product: any) {
  if (typeof window === "undefined") return;
  const cart = getCart();
  const existing = cart.find((p: any) => p._id === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function removeFromCart(productId: string) {
  if (typeof window === "undefined") return;
  const cart = getCart().filter((p: any) => p._id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cart");
}
