import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import '../../../Pages/Overview/Basic';

let titles = [];

class SearchResult {
  constructor(title, id) {
    this.title = title;
    this.id = id;
  }
}

// suggestion to output(in the text)
const getSuggestionValue = suggestion => {
  return suggestion.name.title;
};

// render suggestion list
const renderSuggestion = suggestion => {
  return <div>{suggestion.name.title}</div>;
};

const onSuggestionSelected = (
  event,
  { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
) => {
  if (
    document.getElementById('search-text').getAttribute('searchid') !== null
  ) {
    document.getElementById('display').click();
  }
};

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    let url = '';
    if (props.page === 'wiki') {
      url = '/vevo/wiki_suggestions/';
    } else if (props.page === 'artist') {
      url = '/vevo/artist_suggestions/';
    } else if (props.page === 'video') {
      url = '/vevo/video_suggestions/';
    }

    this.state = {
      activeSearch: false,
      suggestions: [],
      value: '',
      page: props.page,
      url: url,
    };
  }

  onChangeValue = (event, { newValue }) => {
    this.setState(
      {
        value: newValue,
      },
      () => {
        console.log('New state in ASYNC callback:', this.state.value);
      }
    );
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
      .get(this.state.url, options)
      .then(res => {
        titles = [];
        const results = res.data.results;
        for (let i = 0; i < results.length && i < 10; i++) {
          titles.push({
            name: new SearchResult(results[i].name, results[i].id),
          });
        }
        if (inputLength > 0) {
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
    const { value = '', suggestions = titles } = this.state;

    // default place holder
    const inputProps = {
      className: 'search-input',
      id: 'search-text',
      placeholder: 'Type the title',
      value: this.state.value,
      onChange: this.onChangeValue,
    };

    for (let i = 0; i < titles.length; i++) {
      if (titles[i].name.title === this.state.value) {
        inputProps.type = this.state.page;
        inputProps.searchid = titles[i].name.id;
        break;
      }
    }

    return (
      <>
        <div className="search-wrapper active">
          <div className="input-holder">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              onSuggestionSelected={onSuggestionSelected}
              inputProps={inputProps}
            />

            <button
              onClick={() => {
                if (
                  document
                    .getElementById('search-text')
                    .getAttribute('searchid') !== null
                ) {
                  document.getElementById('display').click();
                }
              }}
              className="search-icon"
            >
              <span />
            </button>
          </div>
        </div>
      </>
    );
  }
}

document.getElementsByClassName('react-autosuggest__input').className =
  'search-input';
export default SearchBox;
