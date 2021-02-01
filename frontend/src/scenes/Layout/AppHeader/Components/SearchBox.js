import axios from 'axios';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import '../../../Pages/Overview/Basic';

let titles = [];

class Video {
  constructor(title, id) {
    this.title = title;
    this.id = id;
  }
}

class Artist {
  constructor(artist, id) {
    this.artist = artist;
    this.id = id;
  }
}

// suggestion to output(in the text)
const getSuggestionValue = suggestion => {
  if (suggestion.name instanceof Artist) {
    return suggestion.name.artist;
  } else {
    return suggestion.name.title;
  }
};

// render suggestion list
const renderSuggestion = suggestion => {
  if (suggestion.name instanceof Artist) {
    return <div>A:{suggestion.name.artist}</div>;
  } else {
    return <div>V:{suggestion.name.title}</div>;
  }
};

const onSuggestionSelected = (
  event,
  { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
) => {
  console.log(suggestionValue);
};

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSearch: false,
      suggestions: [],
      value: '',
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
      .get('/vevo/suggestions/', options)
      .then(res => {
        titles = [];
        const result = res.data.title;
        const artist = res.data.artist;
        for (let i = 0; i < artist.length && i < 3; i++) {
          titles.push({ name: new Artist(artist[i].name, artist[i].id) });
        }
        for (let i = 0; i < result.length && i < 5; i++) {
          titles.push({ name: new Video(result[i].name, result[i].id) });
        }
        if (inputLength > 0) {
          this.setState({
            suggestions: titles,
          });
        }
        // console.log(result);
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
      if (
        titles[i].name.title === this.state.value ||
        titles[i].name.artist === this.state.value
      ) {
        inputProps.type = titles[
          i
        ].name.__proto__.constructor.name.toLowerCase();
        inputProps.searchid = titles[i].name.id;
        break;
      }
    }
    // console.log("inputProps", inputProps)

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
      </>
    );
  }
}

document.getElementsByClassName('react-autosuggest__input').className =
  'search-input';
export default SearchBox;
