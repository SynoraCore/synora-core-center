const crypto = require('crypto');

function base64url(buf){
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
}

function signHmac(payloadObj, secret){
  const payload = base64url(JSON.stringify(payloadObj));
  const sig = base64url(crypto.createHmac('sha256', secret).update(payload).digest());
  return `${payload}.${sig}`;
}

function verifyHmac(token, secret){
  if(!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if(parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expSig = base64url(crypto.createHmac('sha256', secret).update(payload).digest());
  try{
    if(!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expSig))) return null;
  } catch { return null; }
  try{
    const obj = JSON.parse(Buffer.from(payload.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));
    return obj;
  } catch { return null; }
}

function parseCookies(req){
  const h = req.headers?.cookie || '';
  const out = {};
  h.split(';').forEach(p => {
    const i = p.indexOf('=');
    if(i < 0) return;
    const k = p.slice(0,i).trim();
    const v = p.slice(i+1).trim();
    if(!k) return;
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function setCookie(res, name, value, opts={}){
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if(opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if(opts.path) parts.push(`Path=${opts.path}`);
  if(opts.httpOnly) parts.push('HttpOnly');
  if(opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if(opts.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function authConfig(){
  const TOTP_SECRET = process.env.SYNORA_TOTP_SECRET || '';
  const SIGNING_KEY = process.env.SYNORA_AUTH_SIGNING_KEY || '';
  const SESSION_TTL_SECONDS = Number(process.env.SYNORA_AUTH_TTL_SECONDS || 60*60*10); // 10h
  if(!TOTP_SECRET || !SIGNING_KEY){
    return { ok:false, error:'missing_env', TOTP_SECRET, SIGNING_KEY, SESSION_TTL_SECONDS };
  }
  return { ok:true, TOTP_SECRET, SIGNING_KEY, SESSION_TTL_SECONDS };
}

function getSession(req){
  const cfg = authConfig();
  if(!cfg.ok) return { authenticated:false, reason: cfg.error };
  const cookies = parseCookies(req);
  const tok = cookies.synora_session;
  const data = verifyHmac(tok, cfg.SIGNING_KEY);
  if(!data) return { authenticated:false, reason:'bad_token' };
  if(!data.exp || Date.now() > data.exp) return { authenticated:false, reason:'expired' };
  return { authenticated:true, session:data };
}

function issueSession(res, claims={}){
  const cfg = authConfig();
  if(!cfg.ok) throw new Error('missing env');
  const exp = Date.now() + cfg.SESSION_TTL_SECONDS*1000;
  const payload = {
    v: 1,
    iat: Date.now(),
    exp,
    role: claims.role || 'admin',
  };
  const tok = signHmac(payload, cfg.SIGNING_KEY);
  setCookie(res, 'synora_session', tok, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    maxAge: cfg.SESSION_TTL_SECONDS,
  });
  return payload;
}

function clearSession(res){
  setCookie(res, 'synora_session', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    maxAge: 0,
  });
}

module.exports = {
  authConfig,
  getSession,
  issueSession,
  clearSession,
};

