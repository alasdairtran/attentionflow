import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isLoading: false,
      hasError: false,
      errorMessage: "",
      title: "",
      artist: ""
    };
  }

  componentDidMount() {
    document.body.classList.add("bg-light");
  }

  fetchCaption = e => {
    e.preventDefault();
    this.setState({ isLoaded: false, isLoading: true, hasError: false });
    const options = {
      params: {
        ID: 12345
      }
    };
    axios
      .get("/vevo/example/", options)
      .then(res => {
        if (res.data.error) {
          this.setState({
            isLoading: false,
            hasError: true,
            isLoaded: false,
            errorMessage: res.data.error
          });
        } else {
          this.setState({
            isLoaded: true,
            isLoading: false,
            title: res.data.title,
            artist: res.data.artist
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    return (
      <div className="container">
        <div className="py-5">
          <h2 className="text-center">vevoviz</h2>
          <p className="lead text-center">
            An interactive visualisation exploring how YouTube music videos
            drive attention to each other.
          </p>
          <p>Click this button to retrieve a test example</p>
          <button
            type="submit"
            className="btn btn-lg btn-primary"
            onClick={this.fetchCaption}
            disabled={this.state.isLoading}
          >
            {this.state.isLoading ? "Fetching data..." : "Get an example"}
          </button>
        </div>
        {this.state.hasError && (
          <div class="alert alert-danger" role="alert">
            {this.state.errorMessage}
          </div>
        )}

        {this.state.isLoaded && (
          <div className="row">
            <div className="col-md-6 mb-4 alert alert-secondary">
              <h4 className="mb-3">{this.state.title}</h4>

              <div className="mb-3">by {this.state.artist}</div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="alert alert-success">
                <h4 className="mb-3">Graph</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default App;
