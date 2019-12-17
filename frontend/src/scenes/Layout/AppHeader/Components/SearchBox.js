import React, { Fragment } from 'react';
import axios from 'axios';

import cx from 'classnames';
import Autocomplete from '@material-ui/lab/useAutocomplete';
import '../../../Pages/Overview/Basic';

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSearch: false,
    };
  }

  render() {
    return (
      <Fragment>
        <div
          className={cx('search-wrapper', {
            active: this.state.activeSearch,
          })}
        >
          <div className="input-holder">
            <input type="text" className="search-input" id="search-text" />
            <button
              onClick={() => {
                if (this.state.activeSearch) {
                  document.getElementById('display').click();
                }
                this.setState({ activeSearch: !this.state.activeSearch });
              }}
              className="search-icon"
            >
              <span />
            </button>
          </div>
          <button
            onClick={() => {
              this.setState({ activeSearch: !this.state.activeSearch });
            }}
            className="close"
          />
        </div>
      </Fragment>
    );
  }
}

export default SearchBox;
