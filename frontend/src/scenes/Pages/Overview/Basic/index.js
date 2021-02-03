import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import classnames from 'classnames';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Redirect } from 'react-router-dom';
import { Card, Col, Row } from 'reactstrap';
import '../../../assets/vevovis.css';

import PageTitle from '../../../Layout/AppMain/PageTitle';
import artist from '../../../assets/utils/images/vevo_artist.png';
import video from '../../../assets/utils/images/vevo_video.png';
import wiki from '../../../assets/utils/images/wiki_traffic.png';

export default class AnalyticsDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      dropdownOpen: false,
      activeTab1: '11',
      isLoaded: false,
      isLoading: true,
      hasError: false,
      errorMessage: '',
      bubblesInfo: {},
      search: false,
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
    //    this.fetchExample();
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
          <button id="display" hidden="hidden" onClick={this.display} />

          <Row>
            <Col md="8" lg="8">
              <div className="text-block">
                <h3>
                  AttentionFlow: Visualising Influence in Networks of Time
                  Series{' '}
                </h3>

                <div>
                  <p>
                    {' '}
                    <b>Abstract:</b> The collective attention on online items
                    such as web pages, search terms, and videos reflects trends
                    that are of social, cultural, and economic interest.
                    Moreover, attention trends of different items exhibit mutual
                    influence via mechanisms such as hyperlinks or
                    recommendations. Many visualisation tools exist for time
                    series, network evolution, or network influence; however,
                    few systems connect all three. In this work, we present
                    AttentionFlow, a new system to visualise networks of time
                    series and the dynamic influence they have on one another.
                    Centred around an ego node, our system simultaneously
                    presents the time series on each node using two visual
                    encodings: a tree ring for an overview and a line chart for
                    details. AttentionFlow supports interactions such as
                    overlaying time series of influence, and filtering
                    neighbours by time or flux. We demonstrate AttentionFlow
                    using two real-world datasets, Vevo and Wiki. We show that
                    attention spikes in songs can be explained by external
                    events such as major awards, or changes in the network such
                    as the release of a new song. Separate case studies also
                    demonstrate how an artist's influence changes over their
                    career, and that correlated Wikipedia traffic is driven by
                    cultural interests. More broadly, AttentionFlow can be
                    generalised to visualise networks of time series on physical
                    infrastructures such as road networks, or natural phenomena
                    such as weather and geological measurements.
                  </p>
                </div>

                <p>
                  {' '}
                  <b>Team:</b> Minjeong Shin, Alasdair Tran, Siqi Wu, Alexander
                  Mathews, Rong Wang, Georgiana Lyall, and Lexing Xie @
                  <a href="http://cm.cecs.anu.edu.au/" target="_blank">
                    ANU Computational Media Lab
                  </a>
                </p>

                <p>
                  {' '}
                  <b>Paper:</b>{' '}
                  <a href="http://cm.cecs.anu.edu.au/" target="_blank">
                    Arxiv link
                  </a>
                </p>

                <p>
                  {' '}
                  <b>Reference:</b> Minjeong Shin, Alasdair Tran, Siqi Wu,
                  Alexander Mathews, Rong Wang, Georgiana Lyall, Lexing Xie.
                  2021. AttentionFlow: Visualising Influence in Networks of Time
                  Series. In the Proceedings of the Fourteenth ACM International
                  Conference on Web Search and Data Mining (WSDM ’21), March
                  8–12, 2021, Virtual Event, Israel. ACM, New York, NY, USA, 4
                  pages.{' '}
                  <a href="https://doi.org/10.1145/3437963.3441703">
                    https://doi.org/10.1145/3437963.3441703
                  </a>
                </p>
              </div>
            </Col>

            <Col md="4" lg="4">
              <div className="video-block">
                <iframe
                  width="100%"
                  height="320"
                  src="https://www.youtube.com/embed/tgbNymZ7vqY"
                ></iframe>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md="8" lg="8">
              <div className="text-block">
                <h4>Use cases</h4>

                <p>
                  {' '}
                  Exploring how a network of (a) musicians, (b) music videos,
                  and (c)Wikipedia pages drive attention to each other.
                </p>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md="12" lg="12">
              <div className="column">
                <div className="single-image">
                  <div className="header-block">
                    <h5> Vevo artist </h5>
                  </div>
                  <a href="/#/overview/artist/UComP_epzeKzvBX156r6pm1Q">
                    <img width="100%" src={artist} />
                  </a>
                </div>
              </div>
              <div className="column">
                <div className="single-image">
                  <div className="header-block">
                    <h5> Vevo video </h5>
                  </div>
                  <a href="/#/overview/video/rYEDA3JcQqw">
                    <img width="100%" src={video} />
                  </a>
                </div>
              </div>
              <div className="column">
                <div className="header-block">
                  <h5> Wiki traffic </h5>
                </div>
                <div className="single-image">
                  <a href="/#/overview/wiki/318487">
                    <img width="100%" src={wiki} />
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
