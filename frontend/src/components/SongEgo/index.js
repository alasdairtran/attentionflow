import React, { Component } from 'react';
import * as d3 from 'd3';

import { drawSongEgo } from '../SongEgo/songEgo';

class BarChart extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    const canvasHeight = oWidth / 2;
    const canvasWidth = oWidth;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);
    let tooltip = d3
      .select(this.refs.canvas)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('top', canvasHeight + 'px')
      .style('left', '0px')
      .style('width', '460px')
      .style('visibility', 'hidden');
    drawSongEgo(
      oWidth,
      oWidth / 2,
      this.props.videos,
      this.props.links,
      svg,
      tooltip
    );
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
