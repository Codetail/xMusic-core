import {h, Component} from 'preact';
import style from './style';

export default class Home extends Component {
  state = {
    results: []
  };

  render(props) {
    return (
      <div class={style.home}>
        <h1>Home</h1>
        {
          (props.children.length > 0) ? props.children : <p>Search for your music among KickAss media.</p>
        }
      </div>
    );
  }
}
