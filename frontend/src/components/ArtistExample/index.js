import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

import { getIncomingOutgoing } from './incomingOutgoing';
import { getSongsByArtist } from './songsByArtist';

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
    this.drawBarChart(oWidth);
  }

  drawBarChart(oWidth) {
    let title = this.props.title;
    let level1 = this.props.level1 === undefined ? [] : this.props.level1;
    let level2 = this.props.level2 === undefined ? [] : this.props.level2;
    let level3 = this.props.level3 === undefined ? [] : this.props.level3;
    let linksArr1 =
      this.props.linksArr1 === undefined ? [] : this.props.linksArr1;
    let linksArr2 =
      this.props.linksArr2 === undefined ? [] : this.props.linksArr2;
    let linksArr3 =
      this.props.linksArr3 === undefined ? [] : this.props.linksArr3;

    let tooltip = d3
      .select(this.refs.canvas)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('right', '0px')
      .style('top', '0px')
      .style('width', '460px')
      .style('visibility', 'hidden')
      .on('click', () => tooltip.style('visibility', 'hidden').html(''));

    const canvasHeight = oWidth * 0.6;
    const canvasWidth = oWidth;
    const verticalMargin = 30;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    let nodeSet = level1.concat(level2, level3);
    nodeSet.push(title);
    nodeSet = nodeSet.map(video => [video[0], video[1], video[2], video[3]]);
    let nodeTitles = nodeSet.map(video => video[0]);
    nodeSet = nodeSet.filter(
      (node, index) => nodeTitles.indexOf(node[0]) === index
    );

    let filteredLinksArr1 = linksArr1.filter(video =>
      nodeTitles.includes(video[1])
    );

    let filteredLinksArr2 = linksArr2.filter(video =>
      nodeTitles.includes(video[1])
    );
    let filteredLinksArr3 = linksArr3.filter(video =>
      nodeTitles.includes(video[1])
    );

    const strokeList = level1
      .map(d => d[4])
      .concat(
        filteredLinksArr1.map(d => d[2]),
        filteredLinksArr2.map(d => d[2]),
        filteredLinksArr3.map(d => d[2])
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

    const nodeScale = 4;
    const colourList = nodeSet.map(d => d[2]);
    // const minColour = '#c38aff';
    // const maxColour = '#5600b0';
    const minInDegree = d3.min(colourList);
    const maxInDegree = d3.max(colourList);
    const colourScale = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([minInDegree, maxInDegree + 5]);
    // const colourScale = d3
    //   .scaleLinear()
    //   .domain([minInDegree, maxInDegree])
    //   .range([minColour, maxColour]);

    const nodes = nodeSet.map(video => ({
      id: video[0],
      radius: radiusScale(video[1]),
      colour: colourScale(video[2]),
    }));

    let links = filteredLinksArr1.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    links.push(
      ...level1.map(video => ({
        source: video[0],
        target: title[0],
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

    let setLinks = [];
    let loops = links.length;
    for (let i = 0; i < loops; i++) {
      let found = false;
      let checking = links.shift();
      for (let j = 0; j < links.length; j++) {
        if (
          ((links[j].source === checking.source &&
            links[j].target === checking.target) ||
            (links[j].source === checking.target &&
              links[j].target === checking.source)) &&
          links[j].value === checking.value
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
        let found2 = false;
        for (let j = 0; j < setLinks.length; j++) {
          if (
            (setLinks[j].source === checking.source &&
              setLinks[j].target === checking.target) ||
            (setLinks[j].source === checking.target &&
              setLinks[j].target === checking.source)
          ) {
            found2 = true;
            setLinks[j].value += checking.value;
            break;
          }
        }
        if (!found2) {
          setLinks.push(checking);
        }
      }
    }

    links = setLinks;

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
      .force('charge', d3.forceManyBody().strength(-1000))
      .force(
        'center',
        d3.forceCenter((canvasWidth - 100) / 2, canvasHeight / 2)
      );

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => 3 * d.value);

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

    node.on('click', d => {
      node.remove();
      link.remove();
      tooltip.style('visibility', 'hidden');
      getIncomingOutgoing(
        d.id,
        canvasWidth,
        canvasHeight,
        verticalMargin,
        svg,
        drag,
        tooltip
      );
      getSongsByArtist(d.id, canvasWidth, canvasHeight, svg, drag, tooltip);
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

    node.on('mouseover', function(d) {
      d3.select(this).style('stroke', 'black');
    });

    node.on('mouseleave', function() {
      d3.select(this).style('stroke', 'none');
    });
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
