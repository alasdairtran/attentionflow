import React, { Component, Fragment } from 'react';
import axios from 'axios';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';

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
import PageTitle from '../../../Layout/AppMain/PageTitle';
import SongEgo from '../../../../components/SongEgo';
import ArtistTop50 from '../../../../components/ArtistTop50';
import { getSongEgo } from '../../../../components/SongEgo/songEgo';
import { getIncomingOutgoing } from '../../../../components/SongEgo/incomingOutgoing';

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
      .get('/vevo/top_50_artists/', options)
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
            artists: res.data.artists,
            links: res.data.links,
          });
        }
      })
      .catch(function(error) {
        console.error(error);
      });
  };

  // For search box
  display = d => {
    if (!this.state.isLoading) {
      d.preventDefault();
      d3.select('#graphContainer').html('');
      d3.select('#graphContainer')
        .append('div')
        .style('width', '50px')
        .style('height', '50px')
        .style('border', '10px solid #f3f3f3')
        .style('border-radius', '50%')
        .style('border-top', '10px solid #3498db')
        .style('animation', 'spin 2s linear infinite')
        .style('margin', '100px auto');
      this.setState({
        isLoaded: true,
        hasError: false,
        isLoading: false,
        title: document.getElementById('search-text').value,
      });
      const oWidth = document.getElementById('headerBar').clientWidth;
      d3.select('#tab1Button').style('display', 'inline');
      d3.select('#tab2Button').style('display', 'inline');
      d3.select('#tab3Button').style('display', 'none');
      d3.select('#titleBar').html(document.getElementById('search-text').value);
      getSongEgo(document.getElementById('search-text').value, oWidth, 1);
      getIncomingOutgoing(document.getElementById('search-text').value, oWidth);
    }
  };

  render() {
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
                <Card className="mb-3">
                  <CardHeader id="headerBar" className="card-header-tab">
                    <div className="card-header-title">
                      <i className="header-icon lnr-rocket icon-gradient bg-tempting-azure">
                        {' '}
                      </i>
                      <h6 id="titleBar">Top 50 Artists</h6>
                    </div>
                    <div className="btn-actions-pane-right">
                      <Button
                        outline
                        id="tab1Button"
                        className={`border-0 btn-pill btn-wide btn-transition ${classnames(
                          {
                            active: this.state.activeTab1 === '11',
                          }
                        )}`}
                        color="primary"
                        onClick={() => {
                          this.toggle1('11');
                        }}
                        style={{ display: 'none' }}
                      >
                        Ego Network
                      </Button>
                      <Button
                        outline
                        id="tab2Button"
                        className={`ml-1 btn-pill btn-wide border-0 btn-transition ${classnames(
                          {
                            active: this.state.activeTab1 === '22',
                          }
                        )}`}
                        color="primary"
                        onClick={() => {
                          this.toggle1('22');
                        }}
                        style={{ display: 'none' }}
                      >
                        Songs by Artist
                      </Button>
                      <Button
                        outline
                        id="tab3Button"
                        className={`ml-1 btn-pill btn-wide border-0 btn-transition ${classnames(
                          {
                            active: this.state.activeTab1 === '33',
                          }
                        )}`}
                        color="primary"
                        onClick={() => {
                          this.toggle1('33');
                        }}
                        style={{ display: 'none' }}
                      >
                        In/Out Flow
                      </Button>
                    </div>
                  </CardHeader>
                  <TabContent activeTab={this.state.activeTab1}>
                    <TabPane tabId="11">
                      <div id="graphContainer" className="col-md-12">
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
                          <ArtistTop50
                            artists={this.state.artists}
                            links={this.state.links}
                          />
                        )}
                      </div>
                    </TabPane>
                    <TabPane tabId="22">
                      <div id="graphContainer2" />
                    </TabPane>
                    <TabPane tabId="33">
                      <div id="graphContainer3" />
                    </TabPane>
                  </TabContent>
                </Card>
              </Col>
              <Col md="12" lg="12">
                <Row>
                  <Col md="3">
                    <div className="card mb-3 bg-arielle-smile widget-chart text-white card-border">
                      <div className="icon-wrapper rounded-circle">
                        <div className="icon-wrapper-bg bg-white opacity-10" />
                        <i className="lnr-cog icon-gradient bg-arielle-smile" />
                      </div>
                      <div className="widget-numbers">87,4</div>
                      <div className="widget-subheading">Reports Generated</div>
                      <div className="widget-description text-white">
                        <FontAwesomeIcon icon={faAngleUp} />
                        <span className="pl-1">54.9%</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="card mb-3 bg-midnight-bloom widget-chart text-white card-border">
                      <div className="icon-wrapper rounded">
                        <div className="icon-wrapper-bg bg-white opacity-10" />
                        <i className="lnr-screen icon-gradient bg-warm-flame" />
                      </div>
                      <div className="widget-numbers">17.2k</div>
                      <div className="widget-subheading">Profiles</div>
                      <div className="widget-description text-white">
                        <span className="pr-1">62,7%</span>
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="card mb-3 bg-grow-early widget-chart text-white card-border">
                      <div className="icon-wrapper rounded">
                        <div className="icon-wrapper-bg bg-dark opacity-9" />
                        <i className="lnr-graduation-hat text-white" />
                      </div>
                      <div className="widget-numbers">63.2k</div>
                      <div className="widget-subheading">Bugs Fixed</div>
                      <div className="widget-description text-white">
                        <FontAwesomeIcon icon={faArrowRight} />
                        <span className="pl-1">72.1%</span>
                      </div>
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="card mb-3 bg-love-kiss widget-chart card-border">
                      <div className="widget-chart-content text-white">
                        <div className="icon-wrapper rounded-circle">
                          <div className="icon-wrapper-bg bg-white opacity-4" />
                          <i className="lnr-cog" />
                        </div>
                        <div className="widget-numbers">45.8k</div>
                        <div className="widget-subheading">Total Views</div>
                        <div className="widget-description">
                          <FontAwesomeIcon
                            className="text-white opacity-5"
                            icon={faAngleUp}
                          />
                          <span className="text-white">175.5%</span>
                        </div>
                      </div>
                      <div className="widget-chart-wrapper">
                        <ResponsiveContainer width="100%" aspect={3.0 / 1.0}>
                          <LineChart
                            data={data}
                            margin={{ top: 0, right: 5, left: 5, bottom: 0 }}
                          >
                            <Line
                              type="monotone"
                              dataKey="pv"
                              stroke="#ffffff"
                              strokeWidth={3}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="card mb-3 widget-chart">
                  <div className="widget-chart-content">
                    <div className="icon-wrapper rounded-circle">
                      <div className="icon-wrapper-bg bg-warning" />
                      <i className="lnr-heart icon-gradient bg-premium-dark">
                        {' '}
                      </i>
                    </div>
                    <div className="widget-numbers">4517.82</div>
                    <div className="widget-subheading">
                      Active Social Profiles
                    </div>
                    <div className="widget-description">
                      Down by
                      <span className="text-danger pl-1 pr-1">
                        <FontAwesomeIcon icon={faAngleDown} />
                        <span className="pl-1">54.1%</span>
                      </span>
                      from 30 days ago
                    </div>
                  </div>
                  <div className="widget-chart-wrapper chart-wrapper-relative">
                    <ResponsiveContainer height={100}>
                      <LineChart
                        data={data2}
                        margin={{ top: 0, right: 5, left: 5, bottom: 0 }}
                      >
                        <Line
                          type="monotone"
                          dataKey="pv"
                          stroke="#d6b5ff"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="uv"
                          stroke="#a75fff"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>
            {/* )} */}
            <div className="row">
              <div className="col-md-6 col-lg-3">
                <div className="card-shadow-danger mb-3 widget-chart widget-chart2 text-left card">
                  <div className="widget-content">
                    <div className="widget-content-outer">
                      <div className="widget-content-wrapper">
                        <div className="widget-content-left pr-2 fsize-1">
                          <div className="widget-numbers mt-0 fsize-3 text-danger">
                            71%
                          </div>
                        </div>
                        <div className="widget-content-right w-100">
                          <div className="progress-bar-xs progress">
                            <div
                              className="progress-bar bg-danger"
                              role="progressbar"
                              aria-valuenow="71"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{ width: '71%' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="widget-content-left fsize-1">
                        <div className="text-muted opacity-6">
                          Income Target
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card-shadow-success mb-3 widget-chart widget-chart2 text-left card">
                  <div className="widget-content">
                    <div className="widget-content-outer">
                      <div className="widget-content-wrapper">
                        <div className="widget-content-left pr-2 fsize-1">
                          <div className="widget-numbers mt-0 fsize-3 text-success">
                            54%
                          </div>
                        </div>
                        <div className="widget-content-right w-100">
                          <div className="progress-bar-xs progress">
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              aria-valuenow="54"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{ width: '54%' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="widget-content-left fsize-1">
                        <div className="text-muted opacity-6">
                          Expenses Target
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card-shadow-warning mb-3 widget-chart widget-chart2 text-left card">
                  <div className="widget-content">
                    <div className="widget-content-outer">
                      <div className="widget-content-wrapper">
                        <div className="widget-content-left pr-2 fsize-1">
                          <div className="widget-numbers mt-0 fsize-3 text-warning">
                            32%
                          </div>
                        </div>
                        <div className="widget-content-right w-100">
                          <div className="progress-bar-xs progress">
                            <div
                              className="progress-bar bg-warning"
                              role="progressbar"
                              aria-valuenow="32"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{ width: '32%' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="widget-content-left fsize-1">
                        <div className="text-muted opacity-6">
                          Spendings Target
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card-shadow-info mb-3 widget-chart widget-chart2 text-left card">
                  <div className="widget-content">
                    <div className="widget-content-outer">
                      <div className="widget-content-wrapper">
                        <div className="widget-content-left pr-2 fsize-1">
                          <div className="widget-numbers mt-0 fsize-3 text-info">
                            89%
                          </div>
                        </div>
                        <div className="widget-content-right w-100">
                          <div className="progress-bar-xs progress">
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              aria-valuenow="89"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{ width: '89%' }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="widget-content-left fsize-1">
                        <div className="text-muted opacity-6">
                          Totals Target
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Row>
              <Col md="4">
                <div className="card mb-3 widget-chart">
                  <div className="widget-chart-content">
                    <div className="icon-wrapper rounded-circle">
                      <div className="icon-wrapper-bg bg-primary" />
                      <i className="lnr-cog text-primary" />
                    </div>
                    <div className="widget-numbers">45.8k</div>
                    <div className="widget-subheading">Total Views</div>
                    <div className="widget-description text-success">
                      <FontAwesomeIcon icon={faAngleUp} />
                      <span className="pl-1">175.5%</span>
                    </div>
                  </div>
                  <div className="widget-chart-wrapper">
                    <ResponsiveContainer width="100%" aspect={3.0 / 1.0}>
                      <LineChart
                        data={data}
                        margin={{ top: 0, right: 5, left: 5, bottom: 0 }}
                      >
                        <Line
                          type="monotone"
                          dataKey="pv"
                          stroke="#3ac47d"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
              <Col md="4">
                <div className="card mb-3 widget-chart">
                  <div className="widget-chart-content">
                    <div className="icon-wrapper rounded-circle">
                      <div className="icon-wrapper-bg bg-success" />
                      <i className="lnr-screen text-success" />
                    </div>
                    <div className="widget-numbers">17.2k</div>
                    <div className="widget-subheading">Profiles</div>
                    <div className="widget-description text-warning">
                      <span className="pr-1">175.5%</span>
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </div>
                  </div>
                  <div className="widget-chart-wrapper">
                    <ResponsiveContainer width="100%" aspect={3.0 / 1.0}>
                      <AreaChart
                        data={data}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <Area
                          type="monotoneX"
                          dataKey="uv"
                          stroke="#fd7e14"
                          fill="#ffb87d"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
              <Col md="4">
                <div className="card mb-3 widget-chart">
                  <div className="widget-chart-content">
                    <div className="icon-wrapper rounded-circle">
                      <div className="icon-wrapper-bg bg-danger" />
                      <i className="lnr-laptop-phone text-danger" />
                    </div>
                    <div className="widget-numbers">5.82k</div>
                    <div className="widget-subheading">Reports Submitted</div>
                    <div className="widget-description text-danger">
                      <FontAwesomeIcon icon={faAngleDown} />
                      <span className="pl-1">54.1%</span>
                    </div>
                  </div>
                  <div className="widget-chart-wrapper">
                    <ResponsiveContainer width="100%" aspect={3.0 / 1.0}>
                      <BarChart data={data}>
                        <Bar
                          dataKey="uv"
                          fill="#81a4ff"
                          stroke="#3f6ad8"
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
