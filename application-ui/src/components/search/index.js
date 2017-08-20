import {h, Component} from "preact";
import * as http from "axios";
import {Spinner, Icon} from "preact-mdl";
import style from "./style.css";

export default class SearchView extends Component {
  cancelToken = null;

  props = {
    onSearchResult: null
  };

  componentDidMount() {
    this.searchIcon = this.base.querySelector(".searchView__icon-item");
    this.spinner = this.searchIcon.nextElementSibling;
    this.spinner.style.display = "none";
  }

  componentWillUnmount() {
    this.searchIcon = null;
    this.spinner = null;
  }

  _toggleSearchState(loading) {
    if (loading) {
      this.searchIcon.style.display = "none";
      this.spinner.style.display = "inline-block";
      this.spinner.classList.add("is-active");
    }else{
      this.spinner.style.display = "none";
      this.searchIcon.style.display = "inline-block";
      this.spinner.classList.remove("is-active");
    }
  }

  performSearch = (event) => {
    this._toggleSearchState(true);

    if (this.cancelToken) {
      this.cancelToken();
    }

    const query = event.target.value;

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

        this._toggleSearchState(false);
      })
      .catch((e) => {
        console.error(e);

        this._toggleSearchState(false);
      });

    return true;
  };

  onSearch = (event) => {
    if (event.which === 13 || event.keyCode === 13) {
      this.performSearch(event);
    }
  };

  onFocus = (event) => {
    this.base.classList.add(style["searchView-input__focused"]);

    event.target.addEventListener("focusout", (event) => {
      event.target.removeEventListener("focusout", this);
      this.base.classList.remove(style["searchView-input__focused"]);
    })
  };

  render(props, state) {
    const id = props.id || this.id;
    return (
      <div class={"mdl-textfield mdl-js-textfield " + style.searchView}>
        <div class={style["searchView-icon"]}>
          <Icon class="searchView__icon-item" icon="search"/>
          <Spinner class={style['searchView-spinner']}/>
        </div>
        <div class={style["searchView-input"]}>
          <input type="text" class="mdl-textfield__input" id={id} value="" placeholder="Search"
                 onKeyDown={this.onSearch} onFocus={this.onFocus}/>
        </div>
      </div>
    );
  }
}