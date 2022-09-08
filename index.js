const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const userCollection = client.db("boxBerry-motor").collection("user");
    const paymentsCollection = client
      .db("boxBerry-motor")
      .collection("payments");

    //create and update a user
    app.put("/create-user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;

      const filter = { email: email };
      const options = { upsert: true };

      const updatedDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10d' });
      res.send(result);
    });

    //get a single user from DB
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const result = await userCollection.findOne(query);
      res.send(result);
    });
    //get all users from db
    app.get("/users", async (req, res) => {
      const query = {};

      const cursor = userCollection.find(query);
      const users = await cursor.toArray();

      res.send(users);
    });
    // check Admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
    // post user admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });

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
    // car booking get by id
    app.get("/carBookings/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const booking = await carToolsBookingCollection.findOne(query);
      res.send(booking);
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
    // restock car item
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

      // Payment
      app.post("/payment-system", async (req, res) => {
        const booking = req.body;
        const price = booking.price;
        console.log(booking);
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      });

      // payment patch
      app.patch("/carBookings/:id", async (req, res) => {
        const id = req.params.id;
        const payment = req.body;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
          $set: {
            paid: true,
            transactionId: payment.transactionId,
          },
        };
        const result = await paymentsCollection.insertOne(payment);
        const updateBooking = await carToolsBookingCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(updateDoc);
      });
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
