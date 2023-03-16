const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.wd2bc6v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        const serviceCollection = client.db("carHub").collection('services');
        const orderCollection = client.db("carHub").collection('orders');

        app.get('/services',async(req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/service/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const service =await serviceCollection.findOne(query);
            res.send(service); 
        })

        app.get('/orders',async(req,res)=>{
            let query = {}
            if(req.query.email){
                query ={email: req.query.email}
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })


        app.delete('/orders/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


        app.patch('/orders/:id',async(req,res)=>{
            const id = req.params.id;
            const status = req.body.status
            const query = {_id: new ObjectId(id)};
            const updateDoc = {
                $set:{
                    status:status
                }
            }
            const result = await orderCollection.updateOne(query,updateDoc);
            res.send(result);
        })



    }
    finally{
        
    }
    
}

run().catch(err => console.error(err));










app.listen(port,()=>{
    console.log("SERVER IS RUNNING");
})