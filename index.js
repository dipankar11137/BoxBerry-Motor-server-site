const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// use middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qdr8xis.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    // collection collected
    const cameraCollection = client
      .db("boxBerry-motor")
      .collection("cameraProducts");
    const carToolsCollection = client
      .db("boxBerry-motor")
      .collection("carTools");
    const carToolsBookingCollection = client
      .db("boxBerry-motor")
      .collection("carToolsBooking");
    const reviewCollection = client.db("boxBerry-motor").collection("review");

    //  Camera products
    app.get("/cameraProducts", async (req, res) => {
      const query = {};
      const cursor = cameraCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/cameraProducts/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const booking = await cameraCollection.findOne(query);
      res.send(booking);
    });

    //  car Tools products
    app.get("/carTools", async (req, res) => {
      const query = {};
      const cursor = carToolsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // post car products
    app.post("/carTools", async (req, res) => {
      const newProduct = req.body;
      const result = await carToolsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/carTools/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const booking = await carToolsCollection.findOne(query);
      res.send(booking);
    });
    // Remove Car product
    app.delete("/carTools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carToolsCollection.deleteOne(query);
      res.send(result);
    });
    // Booking
    // car Booking
    app.post("/carBooking", async (req, res) => {
      const newProducts = req.body;
      const result = await carToolsBookingCollection.insertOne(newProducts);
      res.send(result);
    });

    // get car booking
    app.get("/carBooking", async (req, res) => {
      const query = {};
      const cursor = carToolsBookingCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // car get one email
    app.get("/carBooking/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const cursor = carToolsBookingCollection.find(query);
      const bookingEmail = await cursor.toArray();
      res.send(bookingEmail);
    });
    // Minus order and update
    app.put("/carTools/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await carToolsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Delete car order item
    app.delete("/carBooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carToolsBookingCollection.deleteOne(query);
      res.send(result);
    });

    //review all

    //  get review
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // post review
    app.post("/review", async (req, res) => {
      const newProduct = req.body;
      const result = await reviewCollection.insertOne(newProduct);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running BoxBerry Server");
});

app.listen(port, () => {
  console.log("BoxBerry server is running ");
});
