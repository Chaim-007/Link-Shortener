const express = require('express');
const app = express();
const mongoose = require('mongoose')
const path = require('path');
const link = require('./models/link')
require('dotenv').config();

let dbConnection;

function connectDB() {
    if (!process.env.DB_URI) {
        throw new Error('DB_URI environment variable is missing');
    }

    if (!dbConnection) {
        dbConnection = mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    return dbConnection;
}

const PORT = process.env.PORT || 8000;


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:false}))

app.get("/", (req,res)=>{
    res.render('index.ejs')
})

app.get("/link", async (req,res)=>{
    const shortCode = req.query.short || "";
    const fullUrl = req.query.url || "";
    const shortUrl = shortCode ? `${req.protocol}://${req.get('host')}/${shortCode}` : "";

    res.render('link.ejs', {link: shortCode, url: fullUrl, shortUrl})
})

app.get('/checkBacklink', async (req,res)=>{
    const backlink = req.query.backlink;
    try {
        await connectDB();
        const doc = await link.findOne({shortendedlink: backlink});
        res.json({status: Boolean(doc)});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Unable to check short link'});
    }
})

app.post("/link", async(req,res)=>{
    const mainUrl = req.body.fullurl;
    const backlink = req.body.backlink.trim();

    try {
        await connectDB();
        await link.create({
            fulllink: mainUrl,
            shortendedlink: backlink,
        });
        res.redirect(`/link?short=${encodeURIComponent(backlink)}&url=${encodeURIComponent(mainUrl)}`)
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to shorten link. Please check the database configuration.')
    }
})

app.get('/:shortUrl', async(req,res)=>{
    try {
        await connectDB();
        const shortUrl = await link.findOne({shortendedlink: req.params.shortUrl})
        if(shortUrl == null) return res.sendStatus(404)

        res.redirect(shortUrl.fulllink)
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to open short link. Please check the database configuration.')
    }
})

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, console.log(`Server started on port ${PORT}`));
}

module.exports = app;
