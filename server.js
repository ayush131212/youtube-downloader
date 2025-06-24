const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const app = express();
// Render sets the PORT environment variable for you.
const PORT = process.env.PORT || 3000;

// Serve the static index.html file from the same directory
app.use(express.static(path.join(__dirname)));

// API endpoint to get video info
app.get('/api/video-info', async (req, res) => {
    try {
        const videoURL = req.query.url;
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).json({ error: 'Invalid YouTube URL provided.' });
        }
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            formats: formats
        });
    } catch (err) {
        res.status(500).json({ error: 'Could not get video info. It may be private or age-restricted.' });
    }
});

// API endpoint to trigger the download
app.get('/api/download', async (req, res) => {
    try {
        const { url, itag, title } = req.query;
        if (!ytdl.validateURL(url)) return res.status(400).send('Invalid URL');
        
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { filter: format => format.itag == itag }).pipe(res);
    } catch (err) {
        res.status(500).send('Download failed.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
