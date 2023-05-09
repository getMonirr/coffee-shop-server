import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import * as dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 5000;
dotenv.config();

// middle ware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (req, res) => {
    res.send("coffee shop server is running");
});

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5ku26o.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // coffee shop server start

        const database = client.db("coffeeDB");
        const coffeeCollection = database.collection("coffee");

        // get all coffees
        app.get("/coffees", async (req, res) => {
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        });

        // set new coffees
        app.post("/coffees", async (req, res) => {
            const newCoffee = req.body;

            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        // delete a coffee
        app.delete("/coffees/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        // get a individual coffee
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);

            res.send(result);
        })

        // update a individual coffee

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffeeInfo = req.body;
            console.log(updatedCoffeeInfo);

            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateCoffee = {
                $set: {
                    name: updatedCoffeeInfo?.name,
                    chef: updatedCoffeeInfo?.chef,
                    supplier: updatedCoffeeInfo?.supplier,
                    taste: updatedCoffeeInfo?.taste,
                    category: updatedCoffeeInfo?.category,
                    details: updatedCoffeeInfo?.details,
                    photourl: updatedCoffeeInfo?.photo
                }
            }

            const result = await coffeeCollection.updateOne(filter, updateCoffee, options);

            res.send(result);
        })



        // coffee shop server end

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`coffee shop server is running on port ${port}`);
});
