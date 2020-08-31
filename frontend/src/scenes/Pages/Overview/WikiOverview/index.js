import React, { Component, Fragment } from 'react';
import axios from 'axios';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';
import { Redirect } from 'react-router-dom';

import {
  Row,
  Col,
  Button,
  CardHeader,
  Card,
  CardBody,
  Progress,
  TabContent,
  TabPane,
} from 'reactstrap';

import {
  AreaChart,
  Area,
  Line,
  ResponsiveContainer,
  Bar,
  BarChart,
  ComposedChart,
  CartesianGrid,
  Tooltip,
  LineChart,
} from 'recharts';

import {
  faAngleUp,
  faArrowRight,
  faArrowUp,
  faArrowLeft,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as d3 from 'd3';
import { getIncomingOutgoing } from '../../../../components/VideoEgo/incomingOutgoing';
import PageTitle from '../../../Layout/AppMain/PageTitle';
import WikiFlow from '../../../../components/WikiFlow';

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
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    if (!this.state.videoID) {
      console.log('redirecting');
      return <Redirect push to={`/overview/wiki/rYEDA3JcQqw`} />;
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
            {this.state.hasError && (
              <div className="alert alert-danger" role="alert">
                {this.state.errorMessage}
              </div>
            )}
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
                      <WikiFlow egoType="V" egoInfo={this.state.videoInfo} />
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
