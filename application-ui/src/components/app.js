import {h, Component} from 'preact';
import {Router} from 'preact-router';

import Header from './header';
import Home from '../routes/home';
import SearchView from "./search";
import SongView from "./song";
// import Home from 'async!./home';
// import Profile from 'async!./profile';

export default class App extends Component {

  state = {
    results: []
  };

  onSearchResult = (result) => {
    this.setState({results: result})
  };

  render(props, state) {
    return (
      <div id="app">
        <Header title="xMusic">
          <SearchView onSearchResult={this.onSearchResult}/>
        </Header>

        <Home path="/">
          {
            (this.state.results.length > 0) ?
              this.state.results.map((song) => <SongView song={song}/>) : null
          }
        </Home>
      </div>
    );
  }
}
