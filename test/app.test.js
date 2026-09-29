import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkApp } from '../src/app.js';

// Fake verifier: accepts "good", rejects everything else.
const verify = async (tok) => {
  if (tok !== 'good') throw new Error('bad');
  return { name: 'Ann', email: 'ann@x.com', picture: 'p.png', iat: 1700000000 };
};

let srv, url;

before(async () => {
  // Port 0 = pick any free port.
  srv = mkApp({ cid: 'test-cid', verify }).listen(0);
  await new Promise((ok) => srv.once('listening', ok));
  url = `http://localhost:${srv.address().port}`;
});

after(() => srv.close());

const login = (body) =>
  fetch(`${url}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

test('GET /cfg returns client id', async () => {
  const res = await fetch(`${url}/cfg`);
  assert.deepEqual(await res.json(), { cid: 'test-cid' });
});

test('login without credential -> 400', async () => {
  assert.equal((await login({})).status, 400);
});

test('login with bad token -> 401', async () => {
  assert.equal((await login({ credential: 'bad' })).status, 401);
});

test('login with good token -> user info + timestamp', async () => {
  const res = await login({ credential: 'good' });
  assert.equal(res.status, 200);
  const usr = await res.json();
  assert.equal(usr.name, 'Ann');
  assert.equal(usr.email, 'ann@x.com');
  assert.ok(!isNaN(Date.parse(usr.loginAt)));
  assert.equal(usr.iat, new Date(1700000000 * 1000).toISOString());
});

test('serves index.html', async () => {
  const html = await (await fetch(url)).text();
  assert.match(html, /accounts\.google\.com\/gsi\/client/);
});
