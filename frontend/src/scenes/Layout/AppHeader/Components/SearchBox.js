import React, { Fragment } from 'react';
import axios from 'axios';

import cx from 'classnames';
import '../../../Pages/Overview/Basic';
import Autosuggest from 'react-autosuggest';

var titles = [];

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
    } , () => {
      console.log("New state in ASYNC callback:", this.state.value);
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
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
        if(inputLength > 0){
          this.setState({
            suggestions: titles,
          });
        }
      })
      .catch(function(error) {
        console.error(error);
      });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { value = '', suggestions = titles} = this.state;

    // default place holder
    const inputProps = {
      className: 'search-input',
      id: 'search-text',
      placeholder: 'Type the title',
      value: value,
      onChange: this.onChangeValue,
    };

    return (
      <Fragment>
        <div class="search-wrapper active">
          <div className="input-holder">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              alwaysRenderSuggestions={true}
              inputProps={inputProps}
            ></Autosuggest>

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
        </div>
      </Fragment>
    );
  }
}

document.getElementsByClassName('react-autosuggest__input').className =
  'search-input';
export default SearchBox;
