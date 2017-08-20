/**
 * Created by Ozodrukh on 8/20/17.
 */

const Source = require("./source");
const httpFramework = require("axios");
const globalHttpInstance = httpFramework.create({
  timeout: 15 * 1000
});

const defaultPathMap = new Map();
defaultPathMap.set("list", {path: "/list"});
defaultPathMap.set("search", {path: "/search"});

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
    }).then((response) => response.data)
  }
}

module.exports = HttpSource;