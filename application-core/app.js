/**
 * Created by Ozodrukh on 8/14/17.
 */

const cors = require("cors");
const express = require("express");
const torrentStream = require('torrent-stream');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const sources = require("./sources/index");
const fs = require("fs");
const path = require("path");
const pump = require("pump");

const torrentDir = __dirname + "/tmp";

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.get("/authorize/:source", (req, res) => {
  if (req.params.source === "spotify") {
    if (!req.query.code) {
      res.redirect(sources.SpotifySource.getAuthorizationUrl());
    } else {
      sources.SpotifySource.setAuthorizationCode(req.query.code)
        .then(() => {
          res.status(200).send("Access Granted");
        })
        .catch((e) => {
          res.status(401).send("Failed during authorization");
          console.error("Something went wrong", e);
        })
    }
  }
});

app.get('/search', (req, res) => {
  const querySong = req.query.song || {};

  const songsApi = new sources.KickAssSource();

  songsApi.search(querySong.title, null, {
      giveHealthStatus: true,
      giveScore: true
    })
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
      const metaApi = new sources.SpotifySource();

      const promises = rawSongs.map((song, index) => {
        return metaApi.search(song.title, {artist: song.artist})
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
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send(e);
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
        res.header("Content-Disposition", "inline;filename*=UTF-8\'\'" + songFile.name);
        res.header("Content-Length", songFile.length);
        res.header("Content-Range", `bytes ${0}-${songFile.length}/${songFile.length}`);
        res.status(206).type("audio/mp3");

        console.log(`streaming on path: ${path.join(engine.path, songFile.path)}`);
        const stream = fs.createReadStream(path.join(engine.path, songFile.path));
        pump(stream, res);
      }
    });
  });

  engine.once('idle', () => {
    engine.destroy()
  })
});

app.use((req, res) => {
  res.status(404).json({
    "message": "undefined request"
  })
});

app.listen(3000, () => {
  console.info("Server is launched on port: 3000");
});