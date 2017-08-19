require('string_score');
const httpFramework = require("axios");
const htmlParser = require("cheerio");

const globalHttpInstance = httpFramework.create({
  timeout: 15 * 1000
});

const defaultPathMap = new Map();
defaultPathMap.set("list", {path: "/list"});
defaultPathMap.set("search", {path: "/search"});

/**
 * @namespace SongItem
 * @property title {string}
 * @property album {string}
 * @property artist {string}
 * @property images {object}
 * @property images.small {string} Small image url
 * @property images.medium {string} Medium image url
 * @property images.large {string} Large image url
 * @property images.xLarge {string} Extra large image url
 * @property downloadLink {string}
 */
class Source {

  /**
   * @return {Promise.<Array<SongItem>>} Top songs
   */
  list() {
    return Promise.resolve([]);
  }

  /**
   * @param {string} query Search text
   * @param {object} params Query Parameters
   * @param {object} options
   * @return {Promise.<Array<SongItem>>} Songs that matches given query
   */
  search(query, params, options) {
    return Promise.resolve([]);
  }
}

/**
 * @namespace ApiPath
 * @property {string} path Path to map
 * @property {function} converter
 */

/**
 * @namespace HttpSourceOptions
 * @property {string} endpoint All methods will be pointer to this endpoint
 * @property {httpFramework} httpInstance Already configured http instance. Useful for mocking
 * @property {Map<string, ApiPath>} pathMap Mapping for method to path default points to the method name
 * e.g search method to /search
 */

class HttpSource extends Source {

  /**
   * @param {HttpSourceOptions} options
   */
  constructor(options) {
    super();
    options = Object.assign({
      httpInstance: globalHttpInstance,
      pathMap: defaultPathMap,
    }, options || {});

    this.http = options.httpInstance;
    this.pathMap = options.pathMap;
    this.endpoint = options.endpoint;
  }


  /**
   * @inheritDoc
   */
  list(params) {
    return this._invokeMethod("list", params)
  }

  /**
   * @inheritDoc
   */
  search(query, params, options) {
    if (params) {
      params.query = query;
    }
    return this._invokeMethod("search", params)
  }

  _invokeMethod(methodName, params) {
    const apiPathInfo = this.pathMap.get(methodName);
    if (!apiPathInfo) {
      console.warn(`path mapping for '${methodName}' not found`)
    }

    const path = apiPathInfo.path || '/' + methodName;
    const converter = apiPathInfo.converter;

    return this._makeHttpCal(path, params, converter);
  }

  _makeHttpCal(path, params, converter) {
    return this.http.request({
      url: path,
      params: params,
      baseURL: this.endpoint,
      transformResponse: converter,
    })
  }
}

class LastFMSource extends HttpSource {

  /**
   * @inheritDoc
   */
  constructor(options) {
    super(options);

    this._secret = "9378adf27dc42091589986fc0ac43ed3";
    this.endpoint = "http://ws.audioscrobbler.com/2.0";
  }

  static get defaultParams() {
    return {
      api_key: "e73e855239ef230db3d5d8261ca77d30",
      format: "json"
    };
  }

  /**
   * Searches for track using LastFm track.search method, search
   * site can narrowed by prodiving artist in parameter
   *
   * @param {string} query
   * @param {object} params Query parameters
   * @param {string} params.artist Narrow search by adding artist name
   * @param {number} params.page Results page index
   *
   * @param {object} options
   *
   * @return {Promise.<Response>} Songs that matches given query
   */
  search(query, params, options) {
    params = Object.assign(params || {}, LastFMSource.defaultParams);
    params.method = "track.search";
    params.track = query || " ";

    return this._makeHttpCal("/", params, (response) => {
      response = JSON.parse(response);

      if (!response.results
        || !response.results.trackmatches
        || !response.results.trackmatches.track) {
        return [];
      } else {
        return response.results.trackmatches.track.map((track) => {
          const images = {};
          track.image.forEach((image) => {
            images[image.size] = image["#text"];
          });

          return {
            title: track.name,
            artist: track.artist,
            images: images
          }
        });
      }
    })
  }
}

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


module.exports = Source;
module.exports.HttpSource = HttpSource;
module.exports.LastFMSource = LastFMSource;
module.exports.KickAssSource = KickAssTorrentsSource;