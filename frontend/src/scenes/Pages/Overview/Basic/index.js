import {
  faAngleDown,
  faAngleUp,
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import classnames from 'classnames';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  Col,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import PageTitle from '../../../Layout/AppMain/PageTitle';

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

  // For search box
  display = d => {
    this.setState({
      clickedOnSong: true,
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    //    if (this.state.clickedOnSong === true) {
    //      console.log('redirecting');
    //      return <Redirect push to={`/overview/video/${this.state.videoId}`} />;
    //    }
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
            <PageTitle
              heading="AttentionFlow"
              subheading="An interactive visualisation exploring how YouTube music videos drive attention to each other."
              icon="pe-7s-car icon-gradient bg-mean-fruit"
            />
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
