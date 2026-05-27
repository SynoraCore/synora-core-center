const { getSession, authConfig } = require('../_lib/auth');

module.exports = async function handler(req, res){
  try{
    const cfg = authConfig();
    if(!cfg.ok){
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok:false, authenticated:false, error:'auth_not_configured' }));
      return;
    }
    const s = getSession(req);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:true, authenticated: !!s.authenticated, role: s.session?.role || null }));
  } catch (e){
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok:false, authenticated:false, error:'server_error' }));
  }
};

