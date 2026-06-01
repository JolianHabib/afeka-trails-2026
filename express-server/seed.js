require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  { firstName: 'Jolian', lastName: 'Habib', email: 'jolian@afeka.ac.il', password: 'Jolian123' },
  { firstName: 'Buraq', lastName: 'Yassin', email: 'Buraq@afeka.ac.il', password: 'Buraq123' }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  console.log('✅ Users seeded');
  process.exit();
});