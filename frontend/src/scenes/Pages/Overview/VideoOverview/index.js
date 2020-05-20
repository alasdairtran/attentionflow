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
import VideoInfo from '../../../../components/VideoInfo';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  { name: 'Page C', uv: 2000, pv: 6800, amt: 2290 },
  { name: 'Page D', uv: 4780, pv: 7908, amt: 2000 },
  { name: 'Page E', uv: 2890, pv: 9800, amt: 2181 },
  { name: 'Page F', uv: 1390, pv: 3800, amt: 1500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const data2 = [
  { name: 'Page A', uv: 5400, pv: 5240, amt: 1240 },
  { name: 'Page B', uv: 7300, pv: 4139, amt: 3221 },
  { name: 'Page C', uv: 8200, pv: 7980, amt: 5229 },
  { name: 'Page D', uv: 6278, pv: 4390, amt: 3200 },
  { name: 'Page E', uv: 3189, pv: 7480, amt: 6218 },
  { name: 'Page D', uv: 9478, pv: 6790, amt: 2200 },
  { name: 'Page E', uv: 1289, pv: 1980, amt: 7218 },
  { name: 'Page F', uv: 3139, pv: 2380, amt: 5150 },
  { name: 'Page G', uv: 5349, pv: 3430, amt: 3210 },
];

export default class AnalyticsDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      songId: props.match.params.id,
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
    });
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
    this.fetchExample();
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
    const options = {};
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
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      return <Redirect push to={`/overview/video/${this.state.videoId}`} />;
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
            <Row>
              <Col md="12" lg="12">
                <Card className="mb-3" id="sondInfoCard">
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
                      <VideoInfo videoInfo={this.state.videoInfo} />
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
