import express from 'express';
import { OAuth2Client } from 'google-auth-library';

// Build the express app. `verify` is injectable so tests don't need Google.
export function mkApp({ cid, verify } = {}) {
  const app = express();
  const gc = new OAuth2Client(cid);

  // Default verifier: checks the ID token's signature, expiry and audience with Google.
  verify ??= async (tok) => {
    const t = await gc.verifyIdToken({ idToken: tok, audience: cid });
    return t.getPayload();
  };

  app.use(express.static('public'));
  app.use(express.json());

  // Frontend fetches the client ID from here instead of hardcoding it.
  app.get('/cfg', (req, res) => res.json({ cid }));

  // Frontend posts the Google credential (JWT); we verify it and return user info.
  app.post('/api/login', async (req, res) => {
    const tok = req.body?.credential;
    if (!tok) return res.status(400).json({ err: 'missing credential' });

    let usr;
    try {
      usr = await verify(tok);
    } catch {
      return res.status(401).json({ err: 'invalid token' });
    }

    res.json({
      name: usr.name,
      email: usr.email,
      pic: usr.picture,
      loginAt: new Date().toISOString(),
      iat: usr.iat ? new Date(usr.iat * 1000).toISOString() : null,
    });
  });

  return app;
}
