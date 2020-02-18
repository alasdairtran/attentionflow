import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
  componentDidMount() {
    const oWidth = document.getElementById('headerBar').offsetWidth - 50;
    d3.select('#tab1Button').style('display', 'inline');
    d3.select('#tab2Button').style('display', 'inline');
    d3.select('#titleBar').html(this.props.title);
  }

  render() {
    return <div ref="canvas" />;
  }
}

export default BarChart;
