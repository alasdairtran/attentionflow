import axios from 'axios';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Redirect } from 'react-router-dom';
import { Card, Col, Row } from 'reactstrap';
import Timeseries from '../../../../components/Timeseries';

export default class WikiOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      graphID: props.match.params.id,
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
      graphID: newProps.match.params.id,
    });
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
    if (this.state.graphID) {
      this.fetchExample();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.graphID !== this.state.graphID) {
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
    const options = { params: { graphID: this.state.graphID } };
    console.log('Fetching Wiki page', this.state.graphID);
    axios
      .get('/vevo/wiki_info/', options)
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
            wikiInfo: res.data,
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
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    if (!this.state.graphID) {
      console.log('redirecting');
      return <Redirect push to={`/overview/wiki/318487`} />;
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
          <div>
            <button id="display" hidden="hidden" onClick={this.display} />
            {this.state.hasError ? (
              <div className="alert alert-danger" role="alert">
                {this.state.errorMessage}
              </div>
            ) : (
              <Card className="mb-3" id="attentionFlow">
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
                        <Timeseries egoType="W" egoInfo={this.state.wikiInfo} />
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
