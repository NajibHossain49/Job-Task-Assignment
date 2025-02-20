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

    const { ObjectId } = require('mongodb');

// Get all tasks for a user
app.get("/api/tasks/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const tasks = await Collection.find({ userEmail: email })
      .sort({ order: 1 }) // Sort by order when retrieving
      .toArray();
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, category, userEmail, userName, userPhoto, order } = req.body;
    if (!title || !category || !userEmail) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const task = {
      title,
      description,
      category,
      userEmail,
      userName,
      userPhoto,
      order: order || 0, // Include order in the task document
      timestamp: new Date(),
    };
    const result = await Collection.insertOne(task);
    res.status(201).json({ success: true, task: { ...task, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, order } = req.body;
    
    // Create update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (order !== undefined) updateFields.order = order;

    const result = await Collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update multiple tasks' orders
app.put("/api/tasks/update-orders", async (req, res) => {
  try {
    const { updates } = req.body; // Array of {taskId, order} objects
    
    const operations = updates.map(update => ({
      updateOne: {
        filter: { _id: new ObjectId(update.taskId) },
        update: { $set: { order: update.order } }
      }
    }));

    const result = await Collection.bulkWrite(operations);
    
    res.status(200).json({ 
      success: true, 
      message: "Task orders updated successfully",
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete a task (remains the same)
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
