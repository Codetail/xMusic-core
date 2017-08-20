import {h, Component} from 'preact';
import style from './style';
import {List, Spinner} from "preact-mdl";
import SongView from "../../components/song";

export default class Home extends Component {
  render(props) {
    return (
      <div class={style.home}>
        <h1>Home</h1>
        {props.loading ? <Spinner style="left: 45%" class="is-active"/> : null}

        {(props.songs.length > 0)
          ? <List>{props.songs.map((song) => <SongView song={song}/>)}</List>
          : <p align="center">Search for your music among torrent media.</p>
        }
      </div>
    );
  }
}
