const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

console.log(process.env.DB_PASS)
console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jeh0ui5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    const database = client.db("jobsDB");
    const jobCollections =database.collection("jobCollection");
    const bidProjectCollection =database.collection("bidProjectCollection");
   
    app.get('/alljobs',async(req,res)=>{
         const result = await jobCollections.find({}).toArray()
         res.send(result)
    })
    app.post('/allJobs', async (req, res) => {
      const jobs = req.body;
      console.log(jobs)
      const result = await jobCollections.insertOne(jobs)
      res.send(result)
    })

    // creat api for jobDetails 
    app.get('/jobDetails/:id',async(req,res)=>{
         const id = req.params.id;
         console.log(id)
         const query = {_id: new ObjectId(id)}
         const result = await jobCollections.findOne(query)
         res.send(result)
    }) 
    
  //  display all my bids on the My bids page
   app.get('/displayMyBids',async(req,res)=>{
      console.log(req.query.email)
      let query = {};
      if(req.query.email){
         query = {email: req.query.eamil}
      }
      const result = await bidProjectCollection.find(query).toArray()
      res.send(result)
      
   })
   
  // delet the bid jobs project 
  app.delete('/bidJobs/:id',async(req,res)=>{
     const id = req.params.id;
     console.log(id)
     const query = {_id: new ObjectId(id)};
     const result = await bidProjectCollection.deleteOne(query)
     res.send(result)
  })

  app.patch('/updateBidProgressStatus/:id',async(req,res)=>{
     const id = req.params.id;
     console.log(id)
     const query = {_id: new ObjectId(id)}
     const updateBid = {
        $set: {
           status: "progress"
        }
     }
     const result = await bidProjectCollection.updateOne(query,updateBid)
     res.send(result)
  })

  app.patch('/updateBidRejectStatus/:id',async(req,res)=>{
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const updateBid = {
        $set: {
           status: 'cancelled'
        }
     }
     const result = await bidProjectCollection.updateOne(query,updateBid)
     res.send(result)
  })

  app.patch('/updateBidCompletStatus/:id',async(req,res)=>{
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const updateBid = {
        $set: {
           status: 'completed'
        }
     }
     const result = await bidProjectCollection.updateOne(query,updateBid)
     res.send(result)
  })

    // create api for add bid job  on the database 
    app.post('/storeBidJobs',async(req,res)=>{
      const bidJobs = req.body;
      console.log(bidJobs)
      const result = await bidProjectCollection.insertOne(bidJobs);
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// create a api for insert the all jobs


app.get('/', (req, res) => {
  res.send('assignment 11 server is running')
})

app.listen(port, () => {
  console.log(`assignment 11 server port is ${port}`)
})