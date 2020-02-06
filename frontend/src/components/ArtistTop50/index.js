import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

import { getIncomingOutgoing } from '../ArtistEgo/incomingOutgoing';
import { getSongsByArtist } from '../ArtistEgo/songsByArtist';
import { getArtistEgo } from '../ArtistEgo/artistEgo';

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
    let oWidth = document.getElementById('headerBar').offsetWidth;
    this.drawSongExample(oWidth);
  }

  drawSongExample(oWidth) {
    let artistsArr = this.props.artists;
    let linksArr = this.props.links.filter(link => link[1] !== null);

    const canvasHeight = oWidth / 2;
    const canvasWidth = oWidth;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 80;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const viewsList = artistsArr.map(d => d[1]);
    const maxRadius = 15;
    const minRadius = 3;
    const minViews = d3.min(viewsList);
    const maxViews = d3.max(viewsList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const nodeScale = 4;
    const inDegreeList = artistsArr.map(d => d[2]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([minInDegree, maxInDegree + 5]);

    const nodes = artistsArr.map(video => ({
      id: video[0],
      radius: radiusScale(video[1]),
      colour: colourScale(video[2]),
    }));

    let links = linksArr.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    let nodeTitles = artistsArr.map(song => song[0]);
    let filteredLinks = [];
    let loops = links.length;
    for (let i = 0; i < loops; i++) {
      let found = false;
      let checking = links.shift();
      if (nodeTitles.includes(checking.target)) {
        for (let j = 0; j < filteredLinks.length; j++) {
          if (
            filteredLinks[j].source === checking.target &&
            filteredLinks[j].target === checking.source
          ) {
            found = true;
            filteredLinks[j].value += checking.value;
            break;
          }
        }
        if (!found) {
          filteredLinks.push(checking);
        }
      }
    }

    links = filteredLinks;

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
      .force('center', d3.forceCenter(canvasWidth / 2, canvasHeight / 2));

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
      .style('font-size', '12px')
      .style('visibility', d => (d.radius > 6 ? 'visible' : 'hidden'));

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

    node.on('click', d => {
      d3.select('#tab1Button').style('visibility', 'visible');
      d3.select('#tab2Button').style('visibility', 'visible');
      d3.select('#tab3Button').style('visibility', 'visible');
      svg.remove();
      tooltip.style('visibility', 'hidden');
      d3.select('#titleBar').html(d.id);
      let oWidth = document.getElementById('headerBar').offsetWidth;
      getArtistEgo(d.id, oWidth);
      getSongsByArtist(d.id, oWidth);
      getIncomingOutgoing(d.id, oWidth);
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

    node.on('mouseover', function() {
      d3.select(this)
        .style('stroke', 'black')
        .raise()
        .select('text')
        .style('visibility', 'visible');
    });

    node.on('mouseleave', function() {
      d3.select(this)
        .style('stroke', 'none')
        .select('text')
        .style('visibility', d => (d.radius > 6 ? 'visible' : 'hidden'));
    });
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
