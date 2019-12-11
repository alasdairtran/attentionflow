import React, { Component } from 'react';
import * as d3 from 'd3';
import EgoGraph from '../../components/EgoGraph';
import axios from 'axios';

const drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

class BarChart extends Component {
  componentDidMount() {
    this.drawBarChart();
  }

  drawBarChart() {
    const canvasHeight = 700;
    const canvasWidth = 700;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .style('border', '1px solid black');

    let nodeSet = this.props.level1.concat(this.props.level2);
    nodeSet.push(this.props.title);
    nodeSet = nodeSet.map(video => [video[0], video[1], video[2]]);
    let nodeTitles = nodeSet.map(video => video[0]);
    nodeSet = nodeSet.filter(
      (node, index) => nodeTitles.indexOf(node[0]) === index
    );

    let filteredLinksArr2 = this.props.linksArr2.filter(video =>
      nodeTitles.includes(video[1])
    );

    const strokeList = this.props.level1
      .map(d => d[3])
      .concat(
        this.props.linksArr1.map(d => d[2]),
        filteredLinksArr2.map(d => d[2])
      );
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const radiusList = nodeSet.map(d => d[1]);
    const maxRadius = 15;
    const minRadius = 3;
    const minViews = d3.min(radiusList);
    const maxViews = d3.max(radiusList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const colourList = nodeSet.map(d => d[2]);
    const minColour = '#c38aff';
    const maxColour = '#5600b0';
    const minInDegree = d3.min(colourList);
    const maxInDegree = d3.max(colourList);
    const colourScale = d3
      .scaleLinear()
      .domain([minInDegree, maxInDegree])
      .range([minColour, maxColour]);

    const nodes = nodeSet.map(video => ({
      id: video[0],
      radius: radiusScale(video[1]),
      colour: colourScale(video[2]),
    }));

    const links = this.props.linksArr1.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    links.push(
      ...this.props.level1.map(video => ({
        source: video[0],
        target: this.props.title[0],
        value: strokeScale(video[3]),
      }))
    );

    links.push(
      ...filteredLinksArr2.map(video => ({
        source: video[1],
        target: video[0],
        value: strokeScale(video[2]),
      }))
    );

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(100)
          .strength(0.1)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(canvasWidth / 2, canvasHeight / 2));

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .call(drag(simulation))
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour);

    node.append('title').text(d => d.id);

    node
      .append('text')
      .text(function(d) {
        return d.id;
      })
      .attr('x', 6)
      .attr('y', 3)
      .style('font-size', '10px');

    node.on('click', function(d) {
      console.log('clicked');
      console.log(d.id);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
