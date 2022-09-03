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

    //
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
