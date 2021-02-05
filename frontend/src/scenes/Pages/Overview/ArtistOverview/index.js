import axios from 'axios';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Redirect } from 'react-router-dom';
import { Card, Col, Row } from 'reactstrap';
import Timeseries from '../../../../components/Timeseries';
import SearchBox from '../../../Layout/AppHeader/Components/SearchBox';

export default class AnalyticsDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      artistID: props.match.params.id,
      dropdownOpen: false,
      activeTab1: '11',
      isLoaded: false,
      isLoading: true,
      hasError: false,
      errorMessage: '',
      videos: [],
      artists: [],
      links: [],
    };
    this.toggle = this.toggle.bind(this);
    this.toggle1 = this.toggle1.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      clickedOnArtist: false,
      artistID: newProps.match.params.id,
    });
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
    if (this.state.artistID) {
      this.fetchExample();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.artistID !== this.state.artistID) {
      this.fetchExample();
    }
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  toggle1(tab) {
    if (this.state.activeTab1 !== tab) {
      this.setState({
        activeTab1: tab,
      });
    }
  }

  fetchExample = e => {
    this.setState({ isLoaded: false, isLoading: true, hasError: false });
    const options = { params: { artistID: this.state.artistID } };
    axios
      .get('/vevo/artist_info/', options)
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
            artistInfo: res.data,
          });
        }
      })
      .catch(function(error) {
        console.error(error);
      });
  };

  // For search box
  display = d => {
    this.setState({
      clickedOnSong: true,
      artistID: document.getElementById('search-text').getAttribute('searchid'),
      clickedType: document.getElementById('search-text').getAttribute('type'),
      artistInfo: undefined,
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting', this.state);
      return (
        <Redirect
          push
          to={`/overview/${this.state.clickedType}/${this.state.artistID}`}
        />
      );
    } else if (!this.state.artistID) {
      console.log('redirecting to default artist page');
      return <Redirect push to={`/overview/artist/UComP_epzeKzvBX156r6pm1Q`} />;
    }
    return (
      <>
        <ReactCSSTransitionGroup
          component="div"
          transitionName="TabsAnimation"
          transitionAppear
          transitionAppearTimeout={0}
          transitionEnter={false}
          transitionLeave={false}
        >
          <div class="mainpage">
            <button id="display" hidden="hidden" onClick={this.display} />
            {this.state.hasError ? (
              <div className="alert alert-danger" role="alert">
                {this.state.errorMessage}
              </div>
            ) : (
              <div id="attentionFlow">
                <Row>
                  <Col md="9" lg="9">
                    <div id="egoTitle"></div>
                  </Col>
                  <Col md="3" lg="3">
                    <div class="searchbox">
                      <SearchBox />
                    </div>
                  </Col>
                </Row>
                {this.state.isLoading ? (
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      border: '15px solid #f3f3f3',
                      borderRadius: '50%',
                      borderTop: '15px solid #80d0c7',
                      animation: 'spin 2s linear infinite',
                      margin: '100px auto',
                    }}
                  />
                ) : (
                  <Row>
                    <Col md="3" lg="3" id="egoInfo"></Col>
                    <Col md="9" lg="9" id="egoTimeline">
                      <div id="graphContainer">
                        <Timeseries
                          egoType="A"
                          egoInfo={this.state.artistInfo}
                        />
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            )}
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
