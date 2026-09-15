import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStorefrontUser } from "@/lib/session";

async function getCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) return NextResponse.json({ cart: null });

  const cart = await getCart(user.id);
  return NextResponse.json({ cart });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await req.json();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.inventory < quantity) {
    return NextResponse.json({ error: "Insufficient inventory" }, { status: 400 });
  }

  const cart = await getCart(user.id);
  const existing = cart.items.find((item) => item.productId === productId);
  const newTotalQty = existing ? existing.quantity + quantity : quantity;

  if (product.inventory < newTotalQty) {
    return NextResponse.json({ error: "Insufficient inventory" }, { status: 400 });
  }

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newTotalQty },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        priceCents: product.priceCents,
      },
    });
  }

  const updated = await getCart(user.id);
  return NextResponse.json({ cart: updated });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json();
  if (!itemId || typeof quantity !== "number" || quantity < 1 || quantity > 99) {
    return NextResponse.json({ error: "Invalid itemId or quantity" }, { status: 400 });
  }

  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  if (item.product.inventory < quantity) {
    return NextResponse.json({ error: "Insufficient inventory" }, { status: 400 });
  }

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const cart = await getCart(user.id);
  return NextResponse.json({ cart });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  // Ownership check: the caller may only delete items from their own cart.
  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await db.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
