/**
 * Created by Ozodrukh on 8/14/17.
 */

const cors = require("cors");
const express = require("express");
const torrentStream = require('torrent-stream');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const sources = require("./sources");
const fs = require("fs");
const path = require("path");

const torrentDir = __dirname + "/tmp";

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.get('/search', (req, res) => {
  const querySong = req.query.song || {};
  const meta = Object.assign({
    sources: ["LastFM"]
  }, req.query.meta || {});

  const songsApi = new sources.KickAssSource();

  songsApi.search(querySong.title, null, {
      giveHealthStatus: true,
      giveScore: true
    })
    .then((response) => response.data)
    .then((songs) => {
      return songs.filter(song => song.artist)
        .filter(song => {
          if (querySong.artist) {
            return querySong.artist.score(song.artist) > 0.6;
          } else {
            return true;
          }
        })
        .map((song) => {
          song.downloadLink = "/stream/magnet=" + Buffer.from(song.downloadLink).toString("base64");
          return song;
        });
    })
    .then((rawSongs) => {
      const metaApi = new sources.LastFMSource();

      const promises = rawSongs.map((song, index) => {
        return metaApi.search(song.title, {artist: song.artist})
          .then(response => response.data)
          .then((songs) => {
            if (songs.length > 0) {
              rawSongs[index] = Object.assign(song, songs[0])
            }
          })
      });

      return Promise.all(promises).then(() => Promise.resolve(rawSongs));
    })
    .then((songs) => {
      res.status(200).json({
        query: {
          title: querySong.title || "Nothing",
          artist: querySong.artist || "Unknown",
        },
        result: songs
      })
    });
});

app.all('/stream', (req, res) => {
  function toMagnetLink(value) {
    return Buffer.from(value, "base64").toString()
  }

  const engine = torrentStream(req.body.magnet || toMagnetLink(req.query.magnet), {
    uploads: 0,
    tmp: torrentDir,
    verify: true,
  });

  engine.once('ready', () => {
    engine.files.forEach((songFile, index) => {
      if (index === 0) {
        console.info(`torrent file: ${songFile.name}  with length: ${songFile.length}`);

        res.header("Accept-Ranges", "bytes");
        res.header("Content-Length", songFile.length);
        res.header("Content-Range", `bytes ${0}-${songFile.length}/${songFile.length}`);
        res.status(206).type("audio/mp3");

        const stream = fs.createReadStream(path.join(engine.path, songFile.path));

        stream.once("end", () => {
          console.log(`Stream closed for: ${songFile.name}`);
          stream.close();
          res.end();
        });

        stream.once("readable", () => {
          stream.pipe(res);
        });

      }
    });
  });

  engine.once('idle', () => engine.destroy())
});

app.use((req, res) => {
  res.status(404).json({
    "message": "undefined request"
  })
});

app.listen(3000, () => {
  console.info("Server is launched on port: 3000");
});