import {h, Component} from 'preact';

import Home from '../routes/home';
import SearchView from "./search";

import mdl from 'material-design-lite/material';
import Material from "preact-mdl";
import style from "./style.css";
import api from "../lib/api";

export default class App extends Component {

  state = {
    loading: true,
    results: []
  };

  componentDidMount() {
    api.http.get("/list")
      .then((response) => {
        this.setState({results: response.data.result, loading: false})
      })
      .catch((e) => {
        console.error("Something went wrong, API failed", e);
      });
  }

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
          <Material.Grid>
            <Material.Cell class="mdl-cell--1-col" />
            <Material.Cell class={"mdl-cell--5-col " + style.pageView}>
              <Home path="/" songs={this.state.results} loading={this.state.loading}/>
            </Material.Cell>
          </Material.Grid>
        </Material.LayoutContent>
      </Material.Layout>
    );
  }
}
