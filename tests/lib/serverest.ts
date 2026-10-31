import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './config.ts';
import { buildUser, CartItem, ProductPayload, UserPayload } from './data.ts';

export interface Session {
  userId: string;
  email: string;
  token: string;
}

// The `name` tag groups dynamic URLs (e.g. /produtos/{_id}) into a single
// series in Prometheus/Grafana instead of one series per id.
function params(name: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = token;
  }
  return { headers, tags: { name } };
}

// Returns undefined instead of throwing when the body is empty or not JSON
// (e.g. connection errors under heavy load).
function jsonField(res: RefinedResponse<ResponseType | undefined>, field: string): string | undefined {
  try {
    const value = res.json(field);
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function expectStatus(res: RefinedResponse<ResponseType | undefined>, name: string, status: number): boolean {
  return check(res, { [`${name} status ${status}`]: (r) => r.status === status });
}

export function createUser(user: UserPayload): string | undefined {
  const name = 'POST /usuarios';
  const res = http.post(`${BASE_URL}/usuarios`, JSON.stringify(user), params(name));
  expectStatus(res, name, 201);
  return jsonField(res, '_id');
}

export function deleteUser(userId: string): void {
  const name = 'DELETE /usuarios/{_id}';
  const res = http.del(`${BASE_URL}/usuarios/${userId}`, null, params(name));
  expectStatus(res, name, 200);
}

export function login(email: string, password: string): string | undefined {
  const name = 'POST /login';
  const res = http.post(`${BASE_URL}/login`, JSON.stringify({ email, password }), params(name));
  expectStatus(res, name, 200);
  return jsonField(res, 'authorization');
}

export function listProducts(): RefinedResponse<ResponseType | undefined> {
  const name = 'GET /produtos';
  const res = http.get(`${BASE_URL}/produtos`, params(name));
  expectStatus(res, name, 200);
  return res;
}

export function getProduct(productId: string): void {
  const name = 'GET /produtos/{_id}';
  const res = http.get(`${BASE_URL}/produtos/${productId}`, params(name));
  expectStatus(res, name, 200);
}

export function createProduct(product: ProductPayload, token: string): string | undefined {
  const name = 'POST /produtos';
  const res = http.post(`${BASE_URL}/produtos`, JSON.stringify(product), params(name, token));
  expectStatus(res, name, 201);
  return jsonField(res, '_id');
}

export function deleteProduct(productId: string, token: string): void {
  const name = 'DELETE /produtos/{_id}';
  const res = http.del(`${BASE_URL}/produtos/${productId}`, null, params(name, token));
  expectStatus(res, name, 200);
}

export function createCart(items: CartItem[], token: string): string | undefined {
  const name = 'POST /carrinhos';
  const res = http.post(`${BASE_URL}/carrinhos`, JSON.stringify({ produtos: items }), params(name, token));
  expectStatus(res, name, 201);
  return jsonField(res, '_id');
}

export function finishPurchase(token: string): void {
  const name = 'DELETE /carrinhos/concluir-compra';
  const res = http.del(`${BASE_URL}/carrinhos/concluir-compra`, null, params(name, token));
  expectStatus(res, name, 200);
}

export function cancelPurchase(token: string): void {
  const name = 'DELETE /carrinhos/cancelar-compra';
  const res = http.del(`${BASE_URL}/carrinhos/cancelar-compra`, null, params(name, token));
  expectStatus(res, name, 200);
}

// Creates a new user and logs in with it. Used both in setup() (admin
// session to seed products) and per iteration (customer sessions).
export function createSession(admin = false): Session | undefined {
  const user = buildUser(admin);
  const userId = createUser(user);
  if (!userId) {
    return undefined;
  }
  const token = login(user.email, user.password);
  if (!token) {
    return undefined;
  }
  return { userId, email: user.email, token };
}
