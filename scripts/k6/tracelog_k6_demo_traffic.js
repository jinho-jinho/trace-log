import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Trace-Log demo traffic script.
 *
 * The Spring app generates real shop/admin traffic. The FastAPI pipeline can
 * read nginx logs and import analyzed sessions into Trace-Log.
 *
 * Usage:
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=normal scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=bruteforce scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=sqli scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=admin_scan scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=insider scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=unknown scripts/k6/tracelog_k6_demo_traffic.js
 *   k6 run -e BASE_URL=http://localhost:8081 -e SCENARIO=all scripts/k6/tracelog_k6_demo_traffic.js
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const SCENARIO = (__ENV.SCENARIO || 'normal').toLowerCase();

const PASSWORD = __ENV.DEMO_PASSWORD || '1234';

const ACCOUNTS = {
  normalUsers: [
    { email: __ENV.NORMAL_EMAIL_1 || 'user1@test.com', password: __ENV.NORMAL_PASSWORD_1 || PASSWORD },
    { email: __ENV.NORMAL_EMAIL_2 || 'user2@test.com', password: __ENV.NORMAL_PASSWORD_2 || PASSWORD },
  ],
  adminUser: {
    email: __ENV.ADMIN_EMAIL || 'admin@test.com',
    password: __ENV.ADMIN_PASSWORD || PASSWORD,
  },
};

const NORMAL_UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TraceLogDemo-Normal/1.0 Chrome/136',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) TraceLogDemo-Normal/1.0 Safari/17',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) TraceLogDemo-Normal/1.0 MobileSafari/17',
];

const DEMO_UAS = {
  bruteforce: 'TraceLogDemo-BruteForce/1.0',
  sqli: 'TraceLogDemo-SQLi/1.0',
  adminScan: 'TraceLogDemo-AdminScan/1.0',
  insider: 'TraceLogDemo-InsiderAdmin/1.0 Mozilla-Compatible',
  unknown: 'TraceLogDemo-API-Abuse/1.0',
};

const DEMO_IPS = {
  normal: ['10.10.1.10', '10.10.1.11', '10.10.1.12'],
  bruteforce: ['10.10.9.20'],
  sqli: ['10.10.9.30'],
  adminScan: ['10.10.9.50'],
  insider: ['10.10.2.50'],
  unknown: ['10.10.9.40'],
};

const PRODUCT_IMAGES = [
  '/img/slipon_tree1.jpg',
  '/img/slipon_tree2.jpg',
  '/img/life_daily1.jpg',
  '/img/life_run1.jpg',
  '/img/life_office1.jpg',
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function jitter(min = 0.6, max = 1.8) {
  sleep(min + Math.random() * (max - min));
}

function headers(scenario, userAgent, ip, extra = {}) {
  return {
    headers: {
      'User-Agent': userAgent,
      'X-Forwarded-For': ip,
      'X-Demo-Scenario': scenario,
      ...extra,
    },
  };
}

function jsonHeaders(scenario, userAgent, ip, extra = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'X-Forwarded-For': ip,
      'X-Demo-Scenario': scenario,
      ...extra,
    },
  };
}

function assertResponse(res, label, acceptedStatuses = null) {
  check(res, {
    [`${label} responded`]: (r) => r && r.status > 0,
    [`${label} expected status`]: (r) => {
      if (!r) return false;
      if (acceptedStatuses) return acceptedStatuses.includes(r.status);
      return r.status < 500;
    },
  });
}

function login(email, password, scenario, userAgent, ip, extraHeaders = {}) {
  const payload = JSON.stringify({ email, password });
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    payload,
    jsonHeaders(scenario, userAgent, ip, extraHeaders),
  );
  assertResponse(res, `${scenario} POST /api/auth/login`);
  return res;
}

function visitProductAssets(scenario, userAgent, ip) {
  const h = headers(scenario, userAgent, ip);
  for (const imagePath of PRODUCT_IMAGES.slice(0, 2 + Math.floor(Math.random() * 3))) {
    const res = http.get(`${BASE_URL}${imagePath}`, h);
    assertResponse(res, `${scenario} GET ${imagePath}`);
    jitter(0.1, 0.4);
  }
}

export function normal() {
  const ip = DEMO_IPS.normal[(__VU - 1) % DEMO_IPS.normal.length];
  const userAgent = NORMAL_UAS[(__VU - 1) % NORMAL_UAS.length];
  const scenario = 'normal';

  const h = headers(scenario, userAgent, ip);
  const productIds = [1, 2, 3];

  let res = http.get(`${BASE_URL}/`, h);
  assertResponse(res, 'normal GET /');
  jitter(1.5, 3.0);

  res = http.get(`${BASE_URL}/api/products`, h);
  assertResponse(res, 'normal GET /api/products');
  jitter(1.2, 2.6);

  res = http.get(`${BASE_URL}/products`, h);
  assertResponse(res, 'normal GET /products');
  jitter(1.5, 3.2);

  for (const productId of productIds) {
    res = http.get(`${BASE_URL}/api/products/${productId}`, h);
    assertResponse(res, `normal GET /api/products/${productId}`, [200]);
    jitter(1.4, 3.0);

    res = http.get(`${BASE_URL}/api/products/${productId}/reviews`, h);
    assertResponse(res, `normal GET /api/products/${productId}/reviews`, [200]);
    jitter(1.5, 3.3);
  }
}

export function bruteforce() {
  const ip = DEMO_IPS.bruteforce[0];
  const userAgent = DEMO_UAS.bruteforce;
  const scenario = 'bruteforce';
  const h = headers(scenario, userAgent, ip);

  let res = http.get(`${BASE_URL}/login`, h);
  assertResponse(res, 'bruteforce GET /login');
  jitter(0.2, 0.8);

  const usernames = [
    'admin@test.com',
    'pjho5011@naver.com',
    'user1@test.com',
    'user2@test.com',
    'manager@test.com',
    'test@test.com',
    'customer@test.com',
    'root@test.com',
  ];
  const passwords = [
    '123',
    'password',
    'admin',
    'admin123',
    'qwer1234',
    'password1234',
    'wrong-password',
  ];

  for (const username of usernames) {
    for (const password of passwords) {
      login(username, password, scenario, userAgent, ip);
      jitter(0.05, 0.22);
    }
  }

  res = http.get(`${BASE_URL}/api/auth/me`, h);
  assertResponse(res, 'bruteforce GET /api/auth/me');
  jitter(0.3, 0.8);
}

export function sqli() {
  const ip = DEMO_IPS.sqli[0];
  const userAgent = DEMO_UAS.sqli;
  const scenario = 'sqli';
  const h = headers(scenario, userAgent, ip);

  const payloads = [
    `/api/products?keyword=${encodeURIComponent("'")}`,
    `/api/products?keyword=${encodeURIComponent("' OR '1'='1")}`,
    `/api/products?keyword=${encodeURIComponent("' OR 1=1--")}`,
    `/api/products?keyword=${encodeURIComponent("nike' OR 'x'='x")}`,
    `/api/products?keyword=${encodeURIComponent("nike'--")}`,
    `/api/products?keyword=${encodeURIComponent("nike' ORDER BY 5--")}`,
    `/api/products?keyword=${encodeURIComponent("nike' UNION SELECT null,null--")}`,
    `/api/products?category=${encodeURIComponent("' OR 1=1--")}`,
    `/api/products?brand=${encodeURIComponent("adidas' OR 'a'='a")}`,
    `/api/products?sort=${encodeURIComponent("name' DESC--")}`,
  ];

  for (const path of payloads) {
    const res = http.get(`${BASE_URL}${path}`, h);
    assertResponse(res, `sqli GET ${path}`);
    jitter(0.18, 0.55);
  }

  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: "admin@test.com'--", password: 'anything' }),
    jsonHeaders(scenario, userAgent, ip),
  );
  assertResponse(res, 'sqli POST /api/auth/login');
  jitter(0.3, 0.8);
}

export function adminScan() {
  const ip = DEMO_IPS.adminScan[0];
  const userAgent = DEMO_UAS.adminScan;
  const scenario = 'admin_scan';
  const h = headers(scenario, userAgent, ip);

  const getPaths = [
    '/admin',
    '/admin/login',
    '/admin/select',
    '/admin/products',
    '/api/admin/products',
    '/api/admin/sales',
    '/api/admin/tracelog/dashboard',
    '/api/admin/tracelog/sessions',
    '/api/admin/tracelog/sessions?sort=score',
    '/wp-admin',
    '/wp-login.php',
    '/phpmyadmin',
    '/.env',
    '/.env.local',
    '/.env.production',
    '/.git/config',
    '/config',
    '/config.php',
    '/backup.zip',
    '/backup.sql',
    '/database.sql',
    '/db.sql',
    '/api/admin/users',
    '/api/admin/users/1',
    '/api/admin/users/export',
    '/api/admin/orders/export',
    '/api/admin/config',
    '/api/admin/backup',
    '/api/admin/tracelog/sessions/1',
    '/api/admin/tracelog/sessions/1/logs',
    '/api/internal/tracelog/sessions',
  ];

  const mutationTargets = [1, 2, 3, 4, 5];

  for (let round = 0; round < 3; round += 1) {
    for (const path of getPaths) {
      const res = http.get(`${BASE_URL}${path}`, h);
      assertResponse(res, `admin_scan GET ${path}`);
      jitter(0.08, 0.28);
    }

    for (const productId of mutationTargets) {
      let res = http.patch(
        `${BASE_URL}/api/admin/products/${productId}/discount`,
        JSON.stringify({ discountRate: 99 }),
        jsonHeaders(scenario, userAgent, ip),
      );
      assertResponse(res, `admin_scan PATCH discount ${productId}`);
      jitter(0.08, 0.22);

      res = http.patch(
        `${BASE_URL}/api/admin/products/${productId}/sizes`,
        JSON.stringify({ availableSizes: [220, 230, 240] }),
        jsonHeaders(scenario, userAgent, ip),
      );
      assertResponse(res, `admin_scan PATCH sizes ${productId}`);
      jitter(0.08, 0.22);
    }
  }
}

export function insider() {
  const ip = DEMO_IPS.insider[0];
  const userAgent = DEMO_UAS.insider;
  const scenario = 'insider';
  const extra = { 'X-Demo-User': ACCOUNTS.adminUser.email };
  const h = headers(scenario, userAgent, ip, extra);
  const jsonH = jsonHeaders(scenario, userAgent, ip, extra);

  login(ACCOUNTS.adminUser.email, ACCOUNTS.adminUser.password, scenario, userAgent, ip, extra);
  jitter(0.5, 1.0);

  let res = http.get(`${BASE_URL}/admin`, h);
  assertResponse(res, 'insider GET /admin');
  jitter(0.3, 0.8);

  res = http.get(`${BASE_URL}/admin/products`, h);
  assertResponse(res, 'insider GET /admin/products');
  jitter(0.3, 0.8);

  const focusedReads = [
    '/api/admin/products',
    '/api/admin/sales?start=2026-03-01&end=2026-03-31',
    '/api/admin/sales?start=2026-01-01&end=2026-06-04',
    '/api/admin/sales?start=2025-01-01&end=2026-06-04',
    '/api/admin/sales?start=2024-01-01&end=2026-06-04',
    '/api/admin/tracelog/dashboard',
    '/api/admin/tracelog/sessions?sort=score',
    '/api/admin/tracelog/sessions?sort=latest',
    '/api/admin/tracelog/sessions?ip=172.18.0.1&sort=score',
    '/api/admin/tracelog/sessions/1',
    '/api/admin/tracelog/sessions/1/logs',
    '/api/admin/tracelog/sessions/2',
    '/api/admin/tracelog/sessions/2/logs',
  ];

  for (let round = 0; round < 4; round += 1) {
    for (const path of focusedReads) {
      res = http.get(`${BASE_URL}${path}`, h);
      assertResponse(res, `insider GET ${path}`);
      jitter(0.05, 0.18);
    }
  }

  for (let productId = 1; productId <= 10; productId += 1) {
    res = http.patch(
      `${BASE_URL}/api/admin/products/${productId}/discount`,
      JSON.stringify({
        discountRate: 45 + (productId % 4) * 10,
        saleStart: '2026-06-04T00:00:00',
        saleEnd: '2026-06-30T23:59:59',
      }),
      jsonH,
    );
    assertResponse(res, `insider PATCH discount ${productId}`);
    jitter(0.05, 0.18);

    res = http.patch(
      `${BASE_URL}/api/admin/products/${productId}/sizes`,
      JSON.stringify({ availableSizes: [220, 230, 240, 250, 260, 270, 280, 290] }),
      jsonH,
    );
    assertResponse(res, `insider PATCH sizes ${productId}`);
    jitter(0.05, 0.18);
  }

  for (let repeat = 0; repeat < 4; repeat += 1) {
    res = http.get(`${BASE_URL}/api/admin/sales?start=2020-01-01&end=2026-06-04`, h);
    assertResponse(res, `insider repeated broad sales ${repeat}`);
    jitter(0.05, 0.16);
  }

  res = http.get(`${BASE_URL}/api/admin/tracelog/sessions?sort=score`, h);
  assertResponse(res, 'insider GET /api/admin/tracelog/sessions?sort=score');
  jitter(0.3, 0.8);
}

export function unknown() {
  const ip = DEMO_IPS.unknown[0];
  const userAgent = DEMO_UAS.unknown;
  const scenario = 'unknown';
  const h = headers(scenario, userAgent, ip);
  const jsonH = jsonHeaders(scenario, userAgent, ip);

  const rareParamPaths = [
    '/api/products?include=internal',
    '/api/products?include=inventory',
    '/api/products?include=margin',
    '/api/products?include=cost',
    '/api/products?fields=id,name,basePrice,internalCost,margin',
    '/api/products?fields=id,name,stock,supplierCost',
    '/api/products?debug=true',
    '/api/products?trace=true',
    '/api/products?cache_bypass=true&nocache=1',
    '/api/products?page=-1&size=100000',
  ];

  for (let round = 0; round < 2; round += 1) {
    for (const path of rareParamPaths) {
      const res = http.get(`${BASE_URL}${path}`, h);
      assertResponse(res, `unknown GET ${path}`);
      jitter(0.15, 0.45);
    }
  }

  for (let productId = 1; productId <= 30; productId += 1) {
    let res = http.get(`${BASE_URL}/api/products/${productId}`, h);
    assertResponse(res, `unknown enumerate product ${productId}`);
    jitter(0.08, 0.24);

    res = http.get(`${BASE_URL}/api/products/${productId}/reviews?include=internal&limit=5000`, h);
    assertResponse(res, `unknown enumerate reviews ${productId}`);
    jitter(0.08, 0.24);
  }

  const abnormalApiPaths = [
    '/api/products/internal',
    '/api/products/debug',
    '/api/products/export',
    '/api/products/schema',
    '/api/products/metadata',
    '/api/products/inventory',
    '/api/products/bulk-export',
  ];

  for (const path of abnormalApiPaths) {
    const res = http.get(`${BASE_URL}${path}`, h);
    assertResponse(res, `unknown GET ${path}`);
    jitter(0.12, 0.35);
  }

  const mutationPayloads = [
    { ids: Array.from({ length: 20 }, (_, index) => index + 1), fields: ['id', 'name', 'internalCost', 'margin'] },
    { productIds: Array.from({ length: 20 }, (_, index) => index + 1), includeInternal: true },
  ];

  for (const payload of mutationPayloads) {
    const res = http.post(`${BASE_URL}/api/products/export`, JSON.stringify(payload), jsonH);
    assertResponse(res, 'unknown POST /api/products/export');
    jitter(0.12, 0.35);
  }
}

function runScenarioOnce() {
  switch (SCENARIO) {
    case 'normal':
      normal();
      break;
    case 'bruteforce':
    case 'brute_force':
      bruteforce();
      break;
    case 'sqli':
    case 'sql':
    case 'sql_injection':
      sqli();
      break;
    case 'admin':
    case 'admin_scan':
    case 'admin-scanning':
    case 'scan':
      adminScan();
      break;
    case 'insider':
    case 'admin_insider':
    case 'insider_anomaly':
      insider();
      break;
    case 'unknown':
    case 'zeroday':
    case 'zero_day':
    case 'zero-day':
      unknown();
      break;
    case 'all':
      normal();
      sleep(2);
      bruteforce();
      sleep(2);
      sqli();
      sleep(2);
      adminScan();
      sleep(2);
      insider();
      sleep(2);
      unknown();
      break;
    default:
      throw new Error(
        `Unknown SCENARIO="${SCENARIO}". Use normal, bruteforce, sqli, admin_scan, insider, unknown, or all.`,
      );
  }
}

export const options = {
  scenarios: {
    demo: {
      executor: 'per-vu-iterations',
      vus: SCENARIO === 'normal' ? 1 : 1,
      iterations: 1,
      exec: 'default',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.90'],
  },
};

export default function () {
  runScenarioOnce();
}
