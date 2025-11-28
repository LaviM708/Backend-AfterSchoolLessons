require('dotenv').config();
// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const createApiRouter = require('./routes/api');

const app = express();

app.use(cors()); 
app.use(express.json());

//Middleware
app.use((req, res, next) => {
    console.log("Request URL:", req.url);
    console.log("Method:", req.method);
    console.log("Time:", new Date());
    next();
});

// 1) MongoDB connection
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

app.use("/images", express.static("images"));

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db("afterSchoolLessons");

    const apiRouter = createApiRouter(db);
    app.use('/api', apiRouter);

    app.use((req, res) => {
        res.status(404).json({ error: "Resource not found"});
    });

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
