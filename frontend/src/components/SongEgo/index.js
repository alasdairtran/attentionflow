import React, { Component } from 'react';
import * as d3 from 'd3';

import { getSongEgo } from '../SongEgo/songEgo';
import { getIncomingOutgoing } from './incomingOutgoing';

class BarChart extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('headerBar').offsetWidth - 50;
    d3.select('#tab1Button').style('display', 'inline');
    d3.select('#tab2Button').style('display', 'inline');
    d3.select('#titleBar').html(this.props.title);
    getSongEgo(this.props.title, oWidth, 1);
    getIncomingOutgoing(this.props.title, oWidth);
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
