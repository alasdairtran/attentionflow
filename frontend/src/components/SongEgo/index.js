import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

import { getSongInfo } from './popout';
import { getIncomingOutgoing } from './incomingOutgoing';

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
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    this.drawSongExample(oWidth);
  }

  drawSongExample(oWidth) {
    let nodesArr = this.props.videos;
    let linksArr = this.props.links.filter(link => link[2] !== null);
    let len = linksArr.length;
    let filteredLinksArr = [];
    for (let i = 0; i < len; i++) {
      let checking = linksArr.shift();
      let duplicate = false;
      for (let j = 0; j < linksArr.length; j++) {
        if (checking[0] === linksArr[j][0] && checking[1] === linksArr[j][1]) {
          duplicate = true;
          break;
        }
      }
      if (!duplicate) {
        let found = false;
        for (let j = 0; j < filteredLinksArr.length; j++) {
          if (
            checking[0] === filteredLinksArr[j][1] &&
            checking[1] === filteredLinksArr[j][0]
          ) {
            filteredLinksArr[j][2] += checking[2];
            found = true;
            break;
          }
        }
        if (!found) {
          filteredLinksArr.push(checking);
        }
      }
    }

    const canvasHeight = oWidth / 2;
    const canvasWidth = oWidth;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 130;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    const strokeList = filteredLinksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const radiusList = nodesArr.map(node => node[1]);
    const maxRadius = 15;
    const minRadius = 3;
    const minViews = d3.min(radiusList);
    const maxViews = d3.max(radiusList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const nodeScale = 4;
    const colourList = nodesArr.map(node => node[2]);
    const minInDegree = d3.min(colourList);
    const maxInDegree = d3.max(colourList);
    const colourScale = d3
      .scaleSequential(d3.interpolatePuBu)
      .domain([minInDegree, maxInDegree + 5]);

    const nodes = nodesArr.map(node => ({
      id: node[0],
      radius: radiusScale(node[1]),
      colour: colourScale(node[2]),
    }));

    let links = filteredLinksArr.map(link => ({
      source: link[0],
      target: link[1],
      value: strokeScale(link[2]),
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .strength(0.3)
      )
      .force(
        'collide',
        d3
          .forceCollide()
          .radius(function(d) {
            return nodeScale * d.radius + 10;
          })
          .iterations(2)
      )
      .force('charge', d3.forceManyBody().strength(-1500))
      .force(
        'center',
        d3.forceCenter((canvasWidth - horizontalMargin) / 2, canvasHeight / 2)
      );

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => d.value);

    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .call(drag(simulation))
      .attr('r', d => nodeScale * d.radius)
      .attr('fill', d => d.colour)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 3);

    node.append('title').text(d => d.id);

    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        return d.id;
      })
      .attr('x', function(d) {
        return -2.5 * (1 + d.id.length);
      })
      .attr('y', 3)
      .style('font-size', '12px');

    let tooltip = d3
      .select(this.refs.canvas)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('top', '0px')
      .style('right', '0px')
      .style('width', '460px')
      .style('visibility', 'hidden');

    node.on('click', d => {
      tooltip.style('visibility', 'hidden');
      node.remove();
      link.remove();
      getIncomingOutgoing(
        d.id,
        canvasHeight,
        canvasWidth,
        verticalMargin,
        horizontalMargin,
        drag,
        tooltip,
        svg
      );
    });

    node.on('mouseover', function(d) {
      d3.select(this).style('stroke', 'black');
      tooltip.html('');
      tooltip.style('visibility', 'visible');
      getSongInfo(d, tooltip);
    });

    node.on('mouseleave', function() {
      tooltip.style('visibility', 'hidden');
      d3.select(this).style('stroke', 'none');
    });

    simulation.on('tick', () => {
      node
        .attr('cx', function(d) {
          return (d.x = Math.max(
            nodeScale * d.radius + 20,
            Math.min(canvasWidth - 20 - nodeScale * d.radius, d.x)
          ));
        })
        .attr('cy', function(d) {
          return (d.y = Math.max(
            nodeScale * d.radius + 20,
            Math.min(canvasHeight - 20 - nodeScale * d.radius, d.y)
          ));
        })
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    });
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
