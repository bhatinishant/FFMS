const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Add a simple test route to check if the server is working
app.get('/', (req, res) => {
    res.send('Server is running!');
  });

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const flightRoutes = require('./routes/flights');
app.use('/api', flightRoutes);

const menuRoutes = require('./routes/menu');
app.use('/api', menuRoutes);

try {
  const userInfo = require('./routes/user-info');
  app.use('/api', userInfo);
} catch (err) {
  console.error("Error in userInfo:", err);
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  });
  


    