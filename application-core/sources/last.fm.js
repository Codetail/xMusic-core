const HttpSource = require("./http.source");
const ApiKeys = require("../keys");

class LastFMSource extends HttpSource {

  /**
   * @inheritDoc
   */
  constructor(options) {
    super(options);

    this.endpoint = "http://ws.audioscrobbler.com/2.0";
  }

  static get defaultParams() {
    return {
      api_key: ApiKeys.LAST_FM,
      format: "json"
    };
  }


  static converter() {
    return (response) => {
      response = JSON.parse(response);

      const tracks = response.tracks || (response.hasOwnProperty("results") ? response.results.trackmatches : {});

      if (!tracks || !tracks.track) {
        return [];
      } else {
        return tracks.track.map((track) => {
          const images = {};
          track.image.forEach((image) => {
            images[image.size] = image["#text"];
          });

          return {
            title: track.name,
            artist: typeof track.artist === "string" ? track.artist : track.artist.name,
            images: images
          }
        });
      }
    };
  }

  list(params) {
    params = Object.assign(params || {}, LastFMSource.defaultParams);
    params.method = "chart.gettoptracks";

    return this._makeHttpCal('/', params, LastFMSource.converter());
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

    return this._makeHttpCal("/", params, LastFMSource.converter())
  }
}

module.exports = LastFMSource;