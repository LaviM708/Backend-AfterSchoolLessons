// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const createApiRouter = require('./routes/api');

const app = express();
const PORT = 3000; // backend will run on http://localhost:3000

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
const uri = 'mongodb+srv://LavishaB:87iJp5I4ZRz2Uvr8@cluster0.xcknfis.mongodb.net/?appName=Cluster0';
const client = new MongoClient(uri);

app.use("/images", express.static("images"));

async function startServer() {
  try {
    // connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    // name of the database and collection you created in Atlas
    const db = client.db("afterSchoolLessons");

    // use the router, give it our db
    const apiRouter = createApiRouter(db);
    app.use('/api', apiRouter);

    app.use((req, res) => {
        res.status(404).json({ error: "Resource not found"});
    });

    //Start server
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
