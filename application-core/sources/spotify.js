const Source = require("./source");
const ApiKeys = require("../keys");
const Configurations = require("../configs");
const SpotifyWebApi = require("spotify-web-api-node");

const spotify = new SpotifyWebApi({
  clientId: ApiKeys.Spotify.clientId,
  clientSecret: ApiKeys.Spotify.secret,
  redirectUri: `http://${Configurations.endpoint}:3000/authorize/spotify`,
  accessToken: ApiKeys.Spotify.tmpAccessToken,
  refreshToken: ApiKeys.Spotify.tmpRefreshToken,
});

class SpotifySource extends Source {

  static getAlbumImages(song) {
    const images = {};
    if (song.album.images) {
      song.album.images.forEach((image) => {
        if (image.width === 640) {
          images.large = image.url;
        } else if (image.width === 300) {
          images.medium = image.url;
        } else if (image.width === 64) {
          images.small = image.url;
        }
      })
    }
    return images;
  }

  static getAuthorizationUrl() {
    return spotify.createAuthorizeURL([], null);
  }

  static setAuthorizationCode(code) {
    return spotify.authorizationCodeGrant(code)
      .then((data) => {
        // Set the access token on the API object to use it in later calls
        spotify.setAccessToken(data.body['access_token']);
        spotify.setRefreshToken(data.body['refresh_token']);

        return Promise.resolve();
      });
  }

  constructor() {
    super();
  }


  list() {
    return super.list();
  }

  search(query, params, options) {
    let q = `track:${query}`;
    if (params.artist) {
      q += `  artist:${params.artist}`;
    }
    return spotify.searchTracks(q)
      .then((result) => result.body)
      .then((result) => {
        if (!result.tracks && !result.tracks.items) {
          return [];
        }
        return result.tracks.items.map((song) => {
          return {
            title: song.name,
            album: song.album.name,
            artist: song.artists.name,
            images: SpotifySource.getAlbumImages(song),
          }
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

module.exports = SpotifySource;