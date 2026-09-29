const btn = document.getElementById('btn');
const out = document.getElementById('out');

// Wait until the Google Identity Services script has loaded.
function gsiReady() {
  return new Promise((ok) => {
    const chk = () => (window.google?.accounts?.id ? ok() : setTimeout(chk, 50));
    chk();
  });
}

async function init() {
  const { cid } = await (await fetch('/cfg')).json();
  if (!cid) {
    out.innerHTML = '<p class="err">GOOGLE_CLIENT_ID is not configured on the server.</p>';
    return;
  }

  await gsiReady();
  google.accounts.id.initialize({ client_id: cid, callback: onTok });
  google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
}

// Called by Google after sign-in with a signed ID token (JWT) in `r.credential`.
async function onTok(r) {
  // Send the token to our server for verification.
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ credential: r.credential }),
  });
  const usr = await res.json();

  if (!res.ok) {
    out.innerHTML = `<p class="err">Login failed: ${esc(usr.err)}</p>`;
    return;
  }

  btn.hidden = true;
  out.innerHTML = `
    ${usr.pic ? `<img src="${esc(usr.pic)}" alt="">` : ''}
    <h3>Hello, ${esc(usr.name)}</h3>
    <p>${esc(usr.email)}</p>
    <p>Logged in at: ${new Date(usr.loginAt).toLocaleString()}</p>
    <button id="out-btn">Sign out</button>`;
  document.getElementById('out-btn').onclick = signOut;
}

function signOut() {
  // Stop Google from auto-signing the user back in.
  google.accounts.id.disableAutoSelect();
  out.innerHTML = '';
  btn.hidden = false;
}

// Escape text before putting it into HTML.
function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

init();
