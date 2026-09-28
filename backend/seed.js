const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  const users = [
    ['Administrator Demo Account','admin@example.com','Admin@123','Chhatrapati Sambhajinagar, Maharashtra','admin'],
    ['Store Owner Demo Account','owner@example.com','Owner@123','Pune, Maharashtra','owner'],
    ['Normal User Demo Account','user@example.com','User@123','Jalna, Maharashtra','normal']
  ];

  for (const user of users) {
    const hash = await bcrypt.hash(user[2], 10);
    await pool.query('INSERT INTO users(name,email,password,address,role) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password=VALUES(password),address=VALUES(address),role=VALUES(role)', [user[0],user[1],hash,user[3],user[4]]);
  }

  const [owner] = await pool.query("SELECT id FROM users WHERE email='owner@example.com'");
  if (owner.length) {
    const stores = [
      ['Fresh Basket Grocery Store','MG Road, Pune, Maharashtra'],
      ['Daily Needs Super Market','Station Road, Jalna, Maharashtra']
    ];
    for (const s of stores) {
      await pool.query('INSERT INTO stores(name,address,owner_id) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM stores WHERE name=?)',[s[0],s[1],owner[0].id,s[0]]);
    }
  }
  console.log('Demo data added.');
  await pool.end();
}
seed().catch(err=>{console.error(err);process.exit(1);});
