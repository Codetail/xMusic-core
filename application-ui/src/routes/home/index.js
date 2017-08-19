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
        <p>This is the Home component.</p>
        {props.children}
      </div>
    );
  }
}
