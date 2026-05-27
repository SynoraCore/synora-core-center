const { clearSession } = require('../_lib/auth');

module.exports = async function handler(req, res){
  clearSession(res);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok:true }));
};

