import exec from 'k6/execution';

export interface UserPayload {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
}

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export interface CartItem {
  idProduto: string;
  quantidade: number;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

// ServeRest requires unique e-mails and product names, so every generated
// record combines VU id, time and a random part to avoid collisions.
// Only vu.idInTest is used because it is also available in setup() (as 0).
function uniqueSuffix(): string {
  return `${exec.vu.idInTest}${Date.now()}${randomInt(0, 99999)}`;
}

export function buildUser(admin = false): UserPayload {
  const suffix = uniqueSuffix();
  return {
    nome: `k6 User ${suffix}`,
    // example.com is reserved for testing; ServeRest rejects TLDs like .test
    email: `k6.user.${suffix}@example.com`,
    password: 'k6@perf',
    administrador: admin ? 'true' : 'false',
  };
}

export function buildProduct(): ProductPayload {
  const suffix = uniqueSuffix();
  return {
    nome: `k6 Product ${suffix}`,
    preco: randomInt(10, 5000),
    descricao: 'Product created by k6 performance tests',
    // Every purchase decreases the stock, so it must last for long tests (soak)
    quantidade: 1_000_000,
  };
}
