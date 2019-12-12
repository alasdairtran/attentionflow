import React, { Component } from 'react';
import * as d3 from 'd3';

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

    const incomingNodes = this.props.incoming.map((videoData, i) => ({
      title: videoData[0],
      x: horizontalMargin,
      y:
        this.props.incoming.length === 1
          ? canvasHeight / 2
          : ((canvasHeight - verticalMargin * 2) /
              (this.props.incoming.length - 1)) *
              i +
            verticalMargin,
      radius: radiusScale(videoData[1]),
      colour: colourScale(videoData[2]),
      strokeWidth: strokeScale(videoData[3]),
    }));

    const outgoingNodes = this.props.outgoing.map((videoData, i) => ({
      title: videoData[0],
      x: canvasWidth - horizontalMargin,
      y:
        this.props.outgoing.length === 1
          ? canvasHeight / 2
          : ((canvasHeight - verticalMargin * 2) /
              (this.props.outgoing.length - 1)) *
              i +
            verticalMargin,
      radius: radiusScale(videoData[1]),
      colour: colourScale(videoData[2]),
      strokeWidth: strokeScale(videoData[3]),
    }));

    //Incoming nodes
    svg
      .selectAll('g')
      .data(incomingNodes)
      .enter()
      .append('circle')
      .attr('position', 'relative')
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour)
      .attr('cx', 50)
      .attr('cy', d => d.y);

    //Outgoing nodes
    svg
      .selectAll('g')
      .data(outgoingNodes)
      .enter()
      .append('circle')
      .attr('position', 'relative')
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour)
      .attr('cx', canvasWidth - 50)
      .attr('cy', d => d.y);

    //Original node
    svg
      .selectAll('g')
      .data(this.props.title)
      .enter()
      .append('circle')
      .attr('position', 'relative')
      .attr('r', radiusScale(this.props.title[1]))
      .attr('fill', colourScale(this.props.title[2]))
      .attr('cx', canvasWidth / 2)
      .attr('cy', canvasHeight / 2);

    let originalRadius = radiusScale(this.props.title[1]);
    //Incoming Links
    svg
      .selectAll('g')
      .data(incomingNodes)
      .enter()
      .append('line')
      .attr('position', 'relative')
      .attr('x1', function(d) {
        let x1 = d.x;
        let y1 = d.y;
        let x2 = canvasWidth / 2 - originalRadius;
        let y2 = canvasHeight / 2;
        let theta = Math.atan((y2 - y1) / (x2 - x1));
        return x1 + d.radius * Math.cos(theta);
      })
      .attr('y1', function(d) {
        let x1 = d.x;
        let y1 = d.y;
        let x2 = canvasWidth / 2 - originalRadius;
        let y2 = canvasHeight / 2;
        let theta = Math.atan((y2 - y1) / (x2 - x1));
        return y1 + d.radius * Math.sin(theta);
      })
      .attr('x2', canvasWidth / 2 - originalRadius)
      .attr('y2', canvasHeight / 2)
      .attr('stroke-width', d => d.strokeWidth)
      .style('stroke', 'black');

    //Outgoing Links
    svg
      .selectAll('g')
      .data(outgoingNodes)
      .enter()
      .append('line')
      .attr('position', 'relative')
      .attr('x1', canvasWidth / 2 + originalRadius)
      .attr('y1', canvasHeight / 2)
      .attr('x2', function(d) {
        let x1 = canvasWidth / 2 + originalRadius;
        let y1 = canvasHeight / 2;
        let x2 = d.x;
        let y2 = d.y;
        let theta = y1 === y2 ? 0 : Math.atan((x2 - x1) / (y1 - y2));
        return x2 - d.radius * Math.cos(theta);
      })
      .attr('y2', function(d) {
        let x1 = canvasWidth / 2 + originalRadius;
        let y1 = canvasHeight / 2;
        let x2 = d.x;
        let y2 = d.y;
        let theta = y1 === y2 ? 0 : Math.atan((x2 - x1) / (y1 - y2));
        return y2 + d.radius * Math.sin(theta);
      })
      .attr('stroke-width', d => d.strokeWidth)
      .style('stroke', 'black');

    //Text
    svg
      .selectAll('g')
      .data(this.props.title)
      .enter()
      .append('text')
      .text(this.props.title[0])
      .attr('x', canvasWidth / 2)
      .attr('y', canvasHeight / 2 - radiusScale(this.props.title[1]) - 2)
      .attr('font-size', '10px')
      .attr('fill', 'red')
      .attr('text-anchor', 'middle');

    svg
      .selectAll('g')
      .data(incomingNodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .attr('x', d => d.x - horizontalMargin + 10)
      .attr('y', d => d.y - d.radius - 2)
      .attr('font-size', '10px')
      .attr('fill', 'blue')
      .attr('text-anchor', 'start');

    svg
      .selectAll('g')
      .data(outgoingNodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .attr('x', d => d.x + horizontalMargin - 10)
      .attr('y', d => d.y - d.radius - 2)
      .attr('font-size', '10px')
      .attr('fill', 'black')
      .attr('text-anchor', 'end');

    let dragHandler = d3.drag().on('drag', function() {
      d3.select(this)
        .attr('x', d3.event.x)
        .attr('y', d3.event.y);
    });

    dragHandler(svg.selectAll('use'));
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default EgoGraph;
