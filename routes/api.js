const express = require('express');
const { ObjectId } = require('mongodb');

function createApiRouter(db) {
  const router = express.Router();

  const lessonsCollection = db.collection('lessons');
  const ordersCollection = db.collection('orders');

    // ---- GET /api/lessons ----
    router.get('/lessons', async (req, res) => {
    try {
        // get all lessons from MongoDB and send as JSON
        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons); 
    } catch (err) {
        console.error('Error getting lessons:', err);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
    });

  //POST an order 
    router.post("/order", async (req, res) => {
        try {
            const order = req.body; // order data send from frontend

            order.orderNumber = Math.floor(100000 + Math.random() * 900000);

            const result = await ordersCollection.insertOne(order); // send that order into order Collection

            res.json({ 
                message: 'Order saved!', 
                orderId: result.insertedId,
                orderNumber: order.orderNumber
            });
        } catch (err) {
            console.error('Error saving order: ', err);
            res.status(500).json({ error: 'Failed to save order'});
        }
    });

    //PUT - Add to cart (decrease from Database )
    router.put("/lesson/:id/decrease" , async (req, res) => {
        try {
            const id = req.params.id;
            await lessonsCollection.updateOne (
                { _id: new ObjectId(id) },
                { $inc: { space: -1 } }
            );
            res.json({ message: "Spaces decreased" });
        } catch (err) {
            console.error("Error decreasing spaces: " , err);
            res.status(500).json({ error: "Failed to decrease spaces"});
        }
    });

    //PUT - remove a lesson from cart ( increase in Database)
    router.put("/lesson/:id/increase", async (req, res) => {
        try{
            const id = req.params.id;
            await lessonsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { space: +1} }
            );
            res.json({ message: "Space increased"});
        } catch (err) {
            console.error("Error increasing spaces: ", err);
            res.status(500).json({ error: "Failed to increase spaces"});
        }
    });

    //PUT - update ANY fields in a lesson
    router.put("/lesson/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const updateData = req.body;

            // dont allow id to be change
            if (updateData._id) {
                delete updateData._id;
            }

            const result = await lessonsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (result.matchedCount == 0) {
                return res.status(404).json({ error: "Lesson not found" });
            }

            res.json({ message: "Lesson updated successfully!", updatedFields: updateData });
        } catch (err) {
            console.error("Error updating lesson:", err);
            res.status(500).json({ error: "Failed to update lesson"});
        }
    });

    // GET - search 
    router.get('/search', async (req, res) => {
        try{
            // read ?q from the URl
            const q = (req.query.q || '').trim();

            // If user didn't type anything, return all lessons
            if (!q) {
                const allLessons = await lessonsCollection.find({}).toArray();
                return res.json(allLessons);
            }

            // Text search (subject, location) -  i = case-insensitive
            const regex = new RegExp(q, 'i');

            const orConditions = [ // list of conditions
                { topic: regex },
                { location: regex },
            ];

            // If q is a number , search price and space
            if (!isNaN(q)) {
                const num = Number(q);
                orConditions.push({ price: num });
                orConditions.push({ space: num });
            }

            // ask MongoDB to find any lesson that matches at least on condition
            const results = await lessonsCollection.find({ $or: orConditions }).toArray();
            res.json(results);
        } catch (err) {
            console.error('Error in /search', err);
            res.status(500).json({ error: 'Failed to search lessons' });
        }
    })

  return router;
}

module.exports = createApiRouter;
