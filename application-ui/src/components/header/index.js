import {h, Component} from 'preact';
import {Link} from 'preact-router/match';
import style from './style';
import SearchView from "../search";

export default class Header extends Component {
  render(props) {
    return (
      <header class={style.header}>
        <h1>{props.title}</h1>
        {props.children}
        <nav>
          <Link activeClassName={style.active} href="/">Home</Link>
        </nav>
      </header>
    );
  }
}
