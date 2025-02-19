require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Designed with love 💖 by Najib Hossain");
});

// MongoDB URI and client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.tqv0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and Collection setup
let Collection;

client.connect().then(() => {
  Collection = client.db("TaskFlow").collection("users");
});

async function run() {
  try {
    // Creates the Api endpoints from below.

    // API endpoint to register user
    app.post("/api/users", async (req, res) => {
      try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email || !displayName) {
          return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
        }

        const existingUser = await Collection.findOne({ uid });

        if (existingUser) {
          return res
            .status(200)
            .json({ success: true, message: "User already exists" });
        }

        await Collection.insertOne({ uid, email, displayName });

        res
          .status(201)
          .json({ success: true, message: "User registered successfully" });
      } catch (error) {
        console.error("Error registering user:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
