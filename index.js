require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const {lookup} = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const shortUrls = [];

app.get('/api/shorturl/:url', (req, res) => {
  console.log(req.params.url);
  if (isNaN(+req.params.url)) {
    return res.json({error: 'invalid url'});
  }
  const shortUrl = shortUrls.find(shortUrl1 => shortUrl1.short_url === +req.params.url);
  if (!shortUrl) {
    return res.json({error: 'invalid url'});
  }
  return res.redirect(shortUrl.original_url);
});
app.post('/api/shorturl', (req, res) => {

  if (!isValidUrl(req.body.url)) {
    return res.json({ error: 'invalid url' });
  }

  const urlObject = new URL(req.body.url);

  lookup(urlObject.hostname , (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    const shortUrl = {original_url: req.body.url, short_url: shortUrls.length};

    shortUrls.push(shortUrl);
    return res.json(shortUrl);
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
