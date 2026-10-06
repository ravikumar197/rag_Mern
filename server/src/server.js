// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { connectDB } = require('./config/database');
// const documentRoutes = require('./routes/document.routes');
// const authRoutes = require('./routes/auth.routes');
// const authMiddleware = require('./middleware/auth');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/documents', authMiddleware, documentRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




require('dotenv').config();

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat.routes');

const { connectDB } = require('./config/database');
const vectorService = require('./services/vector/vector.service');

const documentRoutes = require('./routes/document.routes');
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRoutes);

app.use('/api/auth', authRoutes);
app.use(
  '/api/documents',
  authMiddleware,
  documentRoutes
);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // MongoDB
    await connectDB();

    // Qdrant
    await vectorService.initializeCollection();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      'Server startup failed:',
      error.message
    );

    process.exit(1);
  }
}

startServer();