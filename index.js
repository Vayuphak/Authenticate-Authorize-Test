
const express = require('express');
const app = express();

const apiRoutes=require('./route');

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Test Get");
})
app.use('/api', apiRoutes);

app.listen(2000,console.log('Server started'));



