const express = require('express');
const app = express();
const mongoose = require('mongoose')
const shortid = require('shortid')
const path = require('path');
const link = require('./models/link')
require('dotenv').config();

const db = 'mongodb+srv://Chaitanya:UdKx7BwdRudtZuy@linkly.r2qudl1.mongodb.net/?retryWrites=true&w=majority'
mongoose
    .connect(db, { 
        useNewUrlParser: true,
        useCreateIndex: true
      })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 8000;


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:false}))

app.get("/", (req,res)=>{
    res.render('index.ejs')
})

let mainId = "";
let mainUrl = "";
app.get("/link", async (req,res)=>{
    res.render('link.ejs', {link : mainId, url: mainUrl})
    mainId = "";
    mainUrl = "";
})

app.get('/checkBacklink', (req,res)=>{
    const backlink = req.query.backlink;
    link.findOne({short : backlink})
    .then(doc => {
        if(doc){
            res.json({
                status: true,
            })
        }else{
            res.json({
                status: false,
            })
        }
    }).catch(err => {
        console.log(err)
    })
})

app.post("/link", async(req,res)=>{
    mainUrl = req.body.fullurl
    backlink = req.body.backlink
    await link.create({
        full : mainUrl,
        short: backlink,
    });
    mainId = backlink;
    res.redirect("/link")
})

app.get('/:shortUrl', async(req,res)=>{
    const shortUrl = await link.findOne({short: req.params.shortUrl})
    if(shortUrl == null) return res.sendStatus(404)

    shortUrl.save();

    res.redirect(shortUrl.full)
})

app.listen(PORT, console.log(`Server started on port ${PORT}`));