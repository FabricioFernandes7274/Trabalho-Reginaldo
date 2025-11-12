const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data.json');
let db = { users: [], carts: {} };

function load(){
  try{ db = JSON.parse(fs.readFileSync(DATA_FILE,'utf8') || '{}'); }catch(e){ db = { users: [], carts: {} }; }
}
function save(){ fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8'); }

load();

app.get('/api/ping', (req,res)=> res.json({ok:true, time:Date.now()}));

// Register (demo): expects { name, email, passwordHash, salt, iterations }
app.post('/api/register', (req,res)=>{
  const { name, email, passwordHash, salt, iterations } = req.body;
  if (!email || !passwordHash) return res.status(400).json({ error: 'missing_fields' });
  if (db.users.find(u=>u.email===email)) return res.status(409).json({ error: 'exists' });
  db.users.push({ name, email, passwordHash, salt, iterations });
  save();
  return res.json({ ok:true });
});

// Login: expects { identifier, passwordHash? } - for demo, we accept client-side validation and only check existence
app.post('/api/login', (req,res)=>{
  const { identifier } = req.body;
  const user = db.users.find(u => u.email === identifier || u.name === identifier);
  if (!user) return res.status(404).json({ error: 'not_found' });
  // for demo, do not return sensitive fields
  return res.json({ ok:true, user: { name: user.name, email: user.email, iterations: user.iterations, salt: user.salt } });
});

// Cart endpoints: GET /api/cart?email=...  POST /api/cart (body { email, cart })
app.get('/api/cart', (req,res)=>{
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'missing_email' });
  const cart = db.carts[email] || [];
  res.json({ ok:true, cart });
});
app.post('/api/cart', (req,res)=>{
  const { email, cart } = req.body;
  if (!email) return res.status(400).json({ error: 'missing_email' });
  db.carts[email] = cart || [];
  save();
  res.json({ ok:true });
});

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('Demo server running on port', port));
