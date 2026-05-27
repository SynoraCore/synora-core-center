const { authenticator } = require('otplib');
const { authConfig, issueSession } = require('../_lib/auth');

async function readJson(req){
  return new Promise((resolve, reject) => {
    let b='';
    req.on('data', (c)=>{ b += c; if(b.length>50_000) reject(new Error('body_too_large')); });
    req.on('end', ()=>{
      try{ resolve(b ? JSON.parse(b) : {}); } catch(e){ reject(new Error('bad_json')); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res){
  if(req.method !== 'POST'){
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:false, error:'method_not_allowed' }));
    return;
  }

  const cfg = authConfig();
  if(!cfg.ok){
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:false, error:'auth_not_configured' }));
    return;
  }

  try{
    const j = await readJson(req);
    const code = String(j?.code || '').replace(/\s/g,'');
    if(!/^\d{6}$/.test(code)){
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok:false, error:'invalid_code' }));
      return;
    }

    authenticator.options = { window: 1 };
    const ok = authenticator.check(code, cfg.TOTP_SECRET);
    if(!ok){
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok:false, error:'unauthorized' }));
      return;
    }

    const claims = issueSession(res, { role: 'admin' });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:true, authenticated:true, role: claims.role }));
  } catch (e){
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:false, error:'server_error' }));
  }
};

