require('string_score');
const HttpSource = require("./http.source");
const htmlParser = require("cheerio");

class KickAssTorrentsSource extends HttpSource {

  /**
   * @inheritDoc
   */
  constructor(options) {
    super(options);
    this.endpoint = "https://kickass.cd"
  }

  /**
   * Searches for track among torrents
   *
   * @param {string} query
   * @param {object} params Query parameters
   * @param {string} params.giveScore Score matching query with torrent title
   * @param {number} params.giveHealthStatus Gives health status to the each torrent in percentage, were 100%
   * is alive and 0 is fully dead
   *
   * @param {object} options
   *
   * @return {Promise.<Response>} Songs that matches given query
   */
  search(query, params, options) {
    options = options || {};

    return this._makeHttpCal(`/usearch/${query} category:music/`, params, (html) => {
      const document = htmlParser.load(html);
      const searchResults = document("table tr.odd");

      const seedsByIndex = [];
      let maxSeeds = 0;
      if (options.giveHealthStatus) {
        searchResults.each((index, elem) => {
          const seeds = parseInt(document(elem).find("td.green").text());

          if (seeds > maxSeeds) {
            maxSeeds = seeds;
          }

          seedsByIndex[index] = seeds;
        });
      }

      const songs = [];
      searchResults.each((index, element) => {
        const song = {
          downloadLink: document(element).find("a[title=\"Torrent magnet link\"]").attr("href")
        };

        const meta = document(element).find("a.cellMainLink")
          .text().split("-").map(v => v.trim());

        if (meta.length > 1) {
          song.artist = meta[0];
          song.title = meta[1];
        } else {
          song.title = meta[0];
        }

        if (options.giveHealthStatus) {
          song.health = seedsByIndex[index] / maxSeeds;
        }

        if (options.giveScore) {
          song.score = song.title.score(query);
        }

        songs.push(song);
      });

      return songs;
    });
  }
}

module.exports = KickAssTorrentsSource;