import stlye from "./style.css";

export default class SongView {
  render(props, state) {
    const song = props.song;
    return (
      <div>
        { song.images && song.images.medium ? <img src={song.images.medium}/> : null }

        <div>
          <span>{song.title}</span>
          <span>{song.artist}</span>
        </div>
      </div>
    );
  }
}