import React, { Component } from 'react';
import axios from 'axios';
import ExampleChart from '../../components/ExampleChart';
import EgoGraph from '../../components/EgoGraph';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isLoading: false,
      hasError: false,
      errorMessage: '',
      title: [],
      level1: [],
      level2: [],
      linksArr1: [],
      linksArr2: [],
      incoming: [],
      outgoing: [],
      linksArrIncoming: [],
      linksArrOutgoing: [],
    };
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
  }

  fetchExample = e => {
    e.preventDefault();
    this.setState({ isLoaded: false, isLoading: true, hasError: false });
    const options = {
      params: {
        ID: 12345,
      },
    };
    axios
      .get('/vevo/example/', options)
      .then(res => {
        if (res.data.error) {
          this.setState({
            isLoading: false,
            hasError: true,
            isLoaded: false,
            errorMessage: res.data.error,
          });
        } else {
          this.setState({
            isLoaded: true,
            isLoading: false,
            title: res.data.title,
            level1: res.data.level1,
            level2: res.data.level2,
            linksArr1: res.data.linksArr1,
            linksArr2: res.data.linksArr2,
            incoming: res.data.incoming,
            outgoing: res.data.outgoing,
            linksArrIncoming: res.data.linksArrIncoming,
            linksArrOutgoing: res.data.linksArrOutgoing,
          });
        }
      })
      .catch(function(error) {
        console.error(error);
      });
  };

  fetchEgo = e => {
    e.preventDefault();
    this.setState({ isLoaded: false, isLoading: true, hasError: false });
    const options = {
      params: {
        ID: 12345,
      },
    };
    axios
      .get('/vevo/ego/', options)
      .then(res => {
        if (res.data.error) {
          this.setState({
            isLoading: false,
            hasError: true,
            isLoaded: false,
            errorMessage: res.data.error,
          });
        } else {
          this.setState({
            isLoaded: true,
            isLoading: false,
            title: res.data.title,
            level1: res.data.level1,
            level2: res.data.level2,
            linksArr1: res.data.linksArr1,
            linksArr2: res.data.linksArr2,
            incoming: res.data.incoming,
            outgoing: res.data.outgoing,
            linksArrIncoming: res.data.linksArrIncoming,
            linksArrOutgoing: res.data.linksArrOutgoing,
          });
        }
      })
      .catch(function(error) {
        console.error(error);
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
            onClick={this.fetchExample}
            disabled={this.state.isLoading}
          >
            {this.state.isLoading ? 'Fetching data...' : 'Get an example'}
          </button>
        </div>
        {this.state.hasError && (
          <div class="alert alert-danger" role="alert">
            {this.state.errorMessage}
          </div>
        )}

        {this.state.isLoaded && (
          <div className="row">
            <div className="col-md-4 mb-4">
              <h4 className="mb-3">{this.state.title[0]}</h4>
            </div>
            <div className="col-md-8 mb-4">
              <h4 className="mb-3">
                <ExampleChart
                  title={this.state.title}
                  level1={this.state.level1}
                  level2={this.state.level2}
                  linksArr1={this.state.linksArr1}
                  linksArr2={this.state.linksArr2}
                  incoming={this.state.incoming}
                  outgoing={this.state.outgoing}
                  linksArrIncoming={this.state.linksArrIncoming}
                  linksArrOutgoing={this.state.linksArrOutgoing}
                />
              </h4>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default HomePage;
