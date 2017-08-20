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


module.exports = Source;