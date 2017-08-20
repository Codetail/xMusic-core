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

module.exports = LastFMSource;