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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    email: `k6.user.${suffix}@perf.test`,
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
    quantidade: randomInt(100, 1000),
  };
}
