import {h, Component} from 'preact';

import Home from '../routes/home';
import SearchView from "./search";
import SongView from "./song";

import mdl from 'material-design-lite/material';
import Material from "preact-mdl"

export default class App extends Component {

  state = {
    results: []
  };

  onSearchResult = (result) => {
    this.setState({results: result})
  };

  render(props, state) {
    return (
      <Material.Layout id="app" fixed-header={true}>
        <Material.LayoutHeader>
          <Material.LayoutHeaderRow>
            <span class="mdl-layout-title">xMusic</span>
            <Material.LayoutSpacer/>
            <SearchView onSearchResult={this.onSearchResult}/>
          </Material.LayoutHeaderRow>
        </Material.LayoutHeader>

        <Material.LayoutContent>
          <Home path="/">
            {
              (this.state.results.length > 0)
                ? (
                <Material.List>
                  {this.state.results.map((song) => <SongView song={song}/>)}
                </Material.List>
              ) : null
            }
          </Home>
        </Material.LayoutContent>
      </Material.Layout>
    );
  }
}
