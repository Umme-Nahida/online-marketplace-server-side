const express = require('express')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;


app.use(cors({
   origin:['http://localhost:5173'],
   credentials:true
}))
app.use(express.json())
app.use(cookieParser())

// const logger = async(req,res,next)=>{
//    console.log( 'calls',req.host, req.originalUrl)
//    next()
// }

// const VarifyToken = async(req,res,next)=>{
//    const token = req.cookies.cookieName;
//    console.log(token)
//    if(!token){
//       return res.status(401).send({message:'UnAuthrized Access'})
//    }
//    next()
  
// }

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
      const jobCollections = database.collection("jobCollection");
      const bidProjectCollection = database.collection("bidProjectCollection");



      app.get('/sortingBid',async(req,res)=>{
           let query = {};
           const resutl = await bidProjectCollection.find(query).sort({status: -1}).toArray()
           res.send(resutl)
      })
   //   create a secret key 
      app.post('/jwt',async(req,res)=>{
           const user = req.body;
           console.log(user,"thsi is my jwt access user")
           const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '48h'})
           res
           .cookie('cookieName', token,{
            httpOnly: true,
            secure:false
           } )
           .send(token)
      })
      // update specific one posted job from the mongoDB jobCollection
      app.put('/updatePostJob/:id',async(req,res)=>{
         const id = req.params.id;
         console.log('this update id', id)
         const query = {_id: new ObjectId(id)}
         const updateJob = req.body;
         console.log(updateJob)
         const options = { upsert: true };
         const update = {
            $set: {
               email: updateJob.email,
               jobTitle: updateJob.jobTitle,
               deadline: updateJob.deadline, 
               description: updateJob.description, 
               category: updateJob.category, 
               minPrice: updateJob.minPrice, 
               maxPrice: updateJob.maxPrice 
            }
         }
         const result = await jobCollections.updateOne(query,update,options)
         res.send(result)
         
      
      })
       //  delete the job from my posted job page and jobCollectionDB
       app.delete('/myPostedJobDelet/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await jobCollections.deleteOne(query)
         res.send(result)
      })
      // get specific job from jobCollectionsDB
      app.get('/jobDetails/:id', async (req, res) => {
         const id = req.params.id;
         console.log(id)
         const query = { _id: new ObjectId(id) }
         const result = await jobCollections.findOne(query)
         res.send(result)
      })
      //  get the allJobs from mongoDB jobCollections
      app.get('/alljobs', async (req, res) => {
         const result = await jobCollections.find({}).toArray()
         res.send(result)
      })

      // insert the all jobs on the mongoDB jobCollection 
      app.post('/allJobs', async (req, res) => {
         const jobs = req.body;
         console.log(jobs)
         const result = await jobCollections.insertOne(jobs)
         res.send(result)
      })

      //  display all my bids on the My bids page
      app.get('/displayMyBids', async (req, res) => {
         console.log(req.query.email)
         let query = {};
         if (req.query.email) {
            query = { email: req.query.eamil }
         }
         const result = await bidProjectCollection.find(query).toArray()
         res.send(result)

      })

      // delet the bid jobs project 
      app.delete('/bidJobs/:id', async (req, res) => {
         const id = req.params.id;
         console.log(id)
         const query = { _id: new ObjectId(id) };
         const result = await bidProjectCollection.deleteOne(query)
         res.send(result)
      })

      app.patch('/updateBidProgressStatus/:id', async (req, res) => {
         const id = req.params.id;
         console.log(id)
         const query = { _id: new ObjectId(id) }
         const updateBid = {
            $set: {
               status: "progress"
            }
         }
         const result = await bidProjectCollection.updateOne(query, updateBid)
         res.send(result)
      })

      app.patch('/updateBidRejectStatus/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const updateBid = {
            $set: {
               status: 'cancelled'
            }
         }
         const result = await bidProjectCollection.updateOne(query, updateBid)
         res.send(result)
      })

      app.patch('/updateBidCompletStatus/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const updateBid = {
            $set: {
               status: 'completed'
            }
         }
         const result = await bidProjectCollection.updateOne(query, updateBid)
         res.send(result)
      })

      // create api for add bid job  on the database 
      app.post('/storeBidJobs', async (req, res) => {
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

app.get('/', (req, res) => {
   res.send('assignment 11 server is running')
})

app.listen(port, () => {
   console.log(`assignment 11 server port is ${port}`)
})