import axios from 'axios';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Redirect } from 'react-router-dom';
import { Card, Col, Row } from 'reactstrap';
import Timeseries from '../../../../components/Timeseries';

export default class AnalyticsDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      videoID: props.match.params.id,
      dropdownOpen: false,
      activeTab1: '11',
      isLoaded: false,
      isLoading: true,
      hasError: false,
      errorMessage: '',
      links: [],
      videos: [],
    };
    this.toggle = this.toggle.bind(this);
    this.toggle1 = this.toggle1.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      clickedOnSong: false,
      videoID: newProps.match.params.id,
    });
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
    if (this.state.videoID) {
      this.fetchExample();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.videoID !== this.state.videoID) {
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
    const options = { params: { videoID: this.state.videoID } };
    axios
      .get('/vevo/video_info/', options)
      .then(res => {
        if (res.data.error) {
          this.setState({
            isLoading: false,
            hasError: true,
            isLoaded: false,
            errorMessage: res.data.error,
          });
        } else {
          console.log(res.data);
          this.setState({
            isLoaded: true,
            isLoading: false,
            videoInfo: res.data,
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
      videoID: document.getElementById('search-text').getAttribute('searchid'),
      clickedType: document.getElementById('search-text').getAttribute('type'),
      videoInfo: undefined,
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting', this.state);
      return (
        <Redirect
          push
          to={`/overview/${this.state.clickedType}/${this.state.videoID}`}
        />
      );
    } else if (!this.state.videoID) {
      console.log('redirecting to default video page');
      return <Redirect push to={`/overview/video/rYEDA3JcQqw`} />;
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
          <button id="display" hidden="hidden" onClick={this.display} />
          {this.state.hasError ? (
            <div className="alert alert-danger" role="alert">
              {this.state.errorMessage}
            </div>
          ) : (
            <div id="attentionFlow">
              <Row>
                <Col md="12" lg="12" id="egoTitle"></Col>
              </Row>
              <Row>
                <Col md="3" lg="3" id="egoInfo"></Col>
                <Col md="9" lg="9" id="egoTimeline">
                  <div id="graphContainer">
                    {this.state.isLoading ? (
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '10px solid #f3f3f3',
                          borderRadius: '50%',
                          borderTop: '10px solid #3498db',
                          animation: 'spin 2s linear infinite',
                          margin: '100px auto',
                        }}
                      />
                    ) : (
                      <Timeseries egoType="V" egoInfo={this.state.videoInfo} />
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
