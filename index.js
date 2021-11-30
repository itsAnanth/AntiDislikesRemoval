import express, { response } from 'express';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config();
const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.KEY;

app.get('/', (req, res) => {
    res.send('Server managing requests for AntiDislike')
})

app.get('/dislikes', async(req, res) => {
    let videoId = req.query.id;
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`).catch(console.log);
    if (!response) return res.send('Api error :(');
    const json = await response.json()
    res.send(json);
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));