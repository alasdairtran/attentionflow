import React, { Component } from 'react';
import * as d3 from 'd3';

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

class EgoGraph extends Component {
  componentDidMount() {
    this.drawEgoGraph();
  }

  drawEgoGraph() {
    const canvasHeight = 400;
    const canvasWidth = 400;
    const horizontalMargin = 50;
    const verticalMargin = 30;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .style('border', '1px solid black');

    const vidList = this.props.incoming.concat(this.props.outgoing);
    const inLength = this.props.incoming.length;
    const outLength = this.props.outgoing.length;

    const minStroke = 0.5;
    const maxStroke = 3;
    const minWeight = d3.min(vidList.map(videoData => videoData[3]));
    const maxWeight = d3.max(vidList.map(videoData => videoData[3]));
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    vidList.push(this.props.title);

    const maxRadius = Math.min(
      (canvasHeight - verticalMargin * 2) /
        Math.max(this.props.incoming.length, this.props.outgoing.length) /
        2,
      15
    );
    const minRadius = Math.min(3, maxRadius / 4);
    const minViews = d3.min(vidList.map(videoData => videoData[1]));
    const maxViews = d3.max(vidList.map(videoData => videoData[1]));
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const minColour = '#c38aff';
    const maxColour = '#5600b0';
    const minInDegree = d3.min(vidList.map(videoData => videoData[2]));
    const maxInDegree = d3.max(vidList.map(videoData => videoData[2]));
    const colourScale = d3
      .scaleLinear()
      .domain([minInDegree, maxInDegree])
      .range([minColour, maxColour]);

    const nodes = this.props.incoming.map(video => ({
      id: video[0] + 'I',
      radius: radiusScale(video[1]),
      colour: colourScale(video[2]),
      type: 'I',
    }));
    nodes.push(
      ...this.props.outgoing.map(video => ({
        id: video[0] + 'O',
        radius: radiusScale(video[1]),
        colour: colourScale(video[2]),
        type: 'O',
      }))
    );
    nodes.push({
      id: this.props.title[0],
      radius: radiusScale(this.props.title[1]),
      colour: colourScale(this.props.title[2]),
      type: 'C',
    });

    const links = this.props.incoming.map(video => ({
      source: video[0] + 'I',
      target: this.props.title[0],
      value: strokeScale(video[3]),
    }));

    links.push(
      ...this.props.outgoing.map(video => ({
        source: this.props.title[0],
        target: video[0] + 'O',
        value: strokeScale(video[3]),
      }))
    );

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .distance(150)
          .strength(0)
      )
      .force('charge', d3.forceManyBody().strength(0))
      .force(
        'x',
        d3.forceX().x(function(d) {
          if (d.type === 'I') {
            return horizontalMargin;
          } else if (d.type === 'O') {
            return canvasWidth - horizontalMargin;
          } else {
            return canvasWidth / 2;
          }
        })
      )
      .force(
        'y',
        d3.forceY().y(function(d, i) {
          if (d.type === 'I') {
            return inLength === 1
              ? canvasHeight / 2
              : ((canvasHeight - verticalMargin * 2) / (inLength - 1)) * i +
                  verticalMargin;
          } else if (d.type === 'O') {
            return outLength === 1
              ? canvasHeight / 2
              : ((canvasHeight - verticalMargin * 2) / (outLength - 1)) *
                  (i - inLength) +
                  verticalMargin;
          } else {
            return canvasHeight / 2;
          }
        })
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
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour);

    const centreTitle = this.props.title[0];
    node
      .append('text')
      .text(function(d) {
        if (d.id === centreTitle) {
          return d.id;
        }
        return d.id.substring(0, d.id.length - 1);
      })
      .attr('text-anchor', d =>
        d.type === 'I' ? 'end' : d.type === 'O' ? 'start' : 'middle'
      )
      .attr('x', d => (d.type === 'I' ? -6 : d.type === 'O' ? 6 : 0))
      .attr('y', d => (d.type === 'C' ? -15 : 3))
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

export default EgoGraph;
