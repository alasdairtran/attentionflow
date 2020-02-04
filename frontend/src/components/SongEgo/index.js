import React, { Component } from 'react';
import * as d3 from 'd3';

import { getSongEgo } from '../SongEgo/songEgo';
import { getIncomingOutgoing } from './incomingOutgoing';

class BarChart extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    d3.select('#tab1Button').style('visibility', 'visible');
    d3.select('#tab2Button').style('visibility', 'visible');
    getSongEgo(this.props.title, oWidth);
    getIncomingOutgoing(this.props.title, oWidth);
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
