import React, { Fragment } from 'react';
import axios from 'axios';

import cx from 'classnames';
import '../../../Pages/Overview/Basic';
import Autosuggest from 'react-autosuggest';

var titles = [];

//input to suggestion
const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  if (inputLength > 0) {
    const options = {
      params: {
        title: inputValue,
      },
    };
    axios
      .get('/vevo/suggestions/', options)
      .then(res => {
        titles = [];
        var result = res.data.title;
        for (var i = 0; i < result.length; i++) {
          titles.push({ name: result[i] });
        }
        console.log(result);
      })
      .catch(function(error) {
        console.error(error);
      });
  }
  return inputLength === 0 ? [] : titles;
};

//suggestion to output
const getSuggestionValue = suggestion => suggestion.name;

//render suggestion list
const renderSuggestion = suggestion => <div>{suggestion.name}</div>;

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSearch: false,
      suggestions: [],
    };
  }

  onChangeValue = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { value = '', suggestions } = this.state;

    // default place holder
    const inputProps = {
      placeholder: 'Type the title',
      value: value,
      onChange: this.onChangeValue,
    };

    return (
      <Fragment>
        <div
          className={cx('search-wrapper', {
            active: this.state.activeSearch,
          })}
        >
          <div className="input-holder">
            <input
              type="text"
              className="search-input"
              id="search-text"
              onChange={this.onChangeValue}
              value={this.state.value}
              placeholder="Type the title"
            />
            <button
              onClick={() => {
                if (this.state.activeSearch) {
                  alert('clicked');
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
        <Autosuggest
          theme={{
            container: 'input-holder',
            containerOpen: 'input-holder',
            input: 'search-input',
            inputOpen: 'search-input',
            inputFocused: 'search-input',
            suggestionsContainer: 'react-autosuggest__suggestions-container',
            suggestionsContainerOpen:
              'react-autosuggest__suggestions-container--open',
            suggestionsList: 'react-autosuggest__suggestions-list',
            suggestion: 'react-autosuggest__suggestion',
            suggestionFirst: 'react-autosuggest__suggestion--first',
            suggestionHighlighted: 'react-autosuggest__suggestion--highlighted',
            sectionContainer: 'react-autosuggest__section-container',
            sectionContainerFirst:
              'react-autosuggest__section-container--first',
            sectionTitle: 'react-autosuggest__section-title',
          }}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        ></Autosuggest>
      </Fragment>
    );
  }
}

document.getElementsByClassName('react-autosuggest__input').className =
  'search-input';
export default SearchBox;
