import style from "./style.css";
import {ListItem} from "preact-mdl";

export default class SongView {
  render(props, state) {
    const song = props.song;
    return (
      <ListItem two-line={true}>
        <span class="mdl-list__item-primary-content">
          { song.images && song.images.medium ? <img class="mdl-list__item-avatar" src={song.images.medium}/>
            : <span class="mdl-list__item-avatar" style="background:#afafaf"/> }
          <div>
            <span>{song.title}</span>
            <span class="mdl-list__item-sub-title">{song.artist || "Unknown"}</span>
          </div>
        </span>
      </ListItem>
    );
  }
}