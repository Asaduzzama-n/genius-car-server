const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.wd2bc6v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
       return res.status(401).send({message:'Unauthorized Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function(err,decoded){
        if(err){
            return res.status(403).send({message:'Unauthorized Access'});
        }
        req.decoded = decoded;
        next();
    })
}



async function run() {
    try {
        const serviceCollection = client.db("carHub").collection('services');
        const orderCollection = client.db("carHub").collection('orders');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "1d" });
            res.send({ token });

        })


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        app.get('/orders', verifyJWT, async (req, res) => {

            const decoded = req.decoded;
            console.log("inside order:",decoded);

            if(decoded.email !== req.query.email){
                res.send({message:'Unauthorized Access'})
            }

            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })


        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updateDoc);
            res.send(result);
        })



    }
    finally {

    }

}

run().catch(err => console.error(err));










app.listen(port, () => {
    console.log("SERVER IS RUNNING");
})