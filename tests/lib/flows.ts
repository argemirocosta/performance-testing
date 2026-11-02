import { group, sleep } from 'k6';
import { buildProduct, randomInt, randomItem } from './data.ts';
import {
  createCart,
  createProduct,
  createSession,
  deleteProduct,
  deleteUser,
  finishPurchase,
  getProduct,
  listProducts,
  Session,
} from './serverest.ts';

export interface TestData {
  admin: Session;
  productIds: string[];
}

// Runs once in setup(): creates an admin and the product catalog shared
// by all VUs during the test.
export function seedProducts(count: number): TestData {
  const admin = createSession(true);
  if (!admin) {
    throw new Error('Could not create the admin session. Is ServeRest running at BASE_URL?');
  }

  const productIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const productId = createProduct(buildProduct(), admin.token);
    if (productId) {
      productIds.push(productId);
    }
  }
  if (productIds.length === 0) {
    throw new Error('Could not create any product for the test.');
  }

  return { admin, productIds };
}

// Main user journey: a new customer signs up, browses the catalog and
// buys a product. The customer is removed at the end to keep the
// ServeRest in-memory database from growing during long tests.
export function purchaseJourney(data: TestData): void {
  const session = group('sign up and login', () => createSession());
  if (!session) {
    return;
  }
  sleep(randomInt(1, 2));

  const productId = randomItem(data.productIds);
  group('browse products', () => {
    listProducts();
    getProduct(productId);
  });
  sleep(randomInt(1, 3));

  group('checkout', () => {
    const cartId = createCart([{ idProduto: productId, quantidade: 1 }], session.token);
    if (cartId) {
      finishPurchase(session.token);
    }
  });

  deleteUser(session.userId);
  sleep(randomInt(1, 2));
}

// Runs once in teardown(): removes everything created in setup().
export function cleanup(data: TestData): void {
  for (const productId of data.productIds) {
    deleteProduct(productId, data.admin.token);
  }
  deleteUser(data.admin.userId);
}
