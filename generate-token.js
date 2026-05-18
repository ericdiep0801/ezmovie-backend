const jwt = require('jsonwebtoken');
const fs = require('fs');

const secret = 'super-secret-key-123';
const payload = { sub: 12, email: 'thaiduongvl2001@gmail.com', role: 'user' };
const token = jwt.sign(payload, secret, { expiresIn: '7d' });

fs.writeFileSync('token.txt', token);
console.log('Token generated and saved to token.txt:', token);
