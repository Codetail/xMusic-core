import {h, Component} from "preact";
import style from "./style.css";
import SongView from "../song";
import * as http from "axios";

const SEARCH_ACTION = 13;

export default class SearchView extends Component {
  cancelToken = null;

  props = {
    onSearchResult: null
  };

  performSearch(query) {
    if (this.cancelToken) {
      this.cancelToken();
    }

    http.request({
        url: "http://95.46.85.1:3000/search?song[title]=" + query,
        cancelToken: new http.CancelToken((token) => {
          this.cancelToken = token;
        })
      })
      .then((response) => response.data)
      .then((response) => {
        if (this.props.onSearchResult) {
          this.props.onSearchResult(response.result);
        }
      })
      .catch((e) => {
        console.error(e)
      })
  }

  /**
   * @param event {Event}
   */
  suggestedQueries = (event) => {
    if (event.which === SEARCH_ACTION || event.keyCode === SEARCH_ACTION) {
      this.performSearch(event.target.value);
    }
  };

  render(props, state) {
    return (
      <div class={style['search-field']}>
        <input type="text" onKeyDown={this.suggestedQueries}/>
      </div>
    );
  }
}