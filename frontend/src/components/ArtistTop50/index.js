import React, { Component } from 'react';
import * as d3 from 'd3';

import { Redirect } from 'react-router-dom';
import {
  strokeScaleFunc,
  radiusScaleFunc,
  colorScaleFunc,
  drag,
} from '../Helper/helper';

let vis;
class BarChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnArtist: false,
      id: null,
    };
  }

  componentDidMount() {
    const oWidth = document.getElementById('headerBar').offsetWidth - 50;
    this.drawVideoExample(oWidth);
  }

  drawVideoExample(oWidth) {
    const artistsArr = this.props.artists;
    const linksArr = this.props.links;

    const canvasHeight = oWidth * 0.6;
    const canvasWidth = oWidth;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 80;
    const outer = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .attr('pointer-events', 'all');
    outer
      .append('rect')
      .attr('class', 'background')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('fill', '#FFF')
      .call(d3.zoom().on('zoom', this.redraw));

    vis = outer.append('g');

    const strokeList = linksArr.map(link => link[2]);
    const strokeScale = strokeScaleFunc(strokeList);

    const viewsList = artistsArr.map(artist => artist[2]);
    const radiusScale = radiusScaleFunc(viewsList);

    const inDegreeList = artistsArr.map(artist => artist[3]);
    const colorScale = colorScaleFunc(inDegreeList);

    let nodes = artistsArr.map(artist => ({
      name: artist[0],
      id: artist[1],
      radius: radiusScale(artist[2]),
      colour: colorScale(artist[3]),
    }));

    let links = linksArr.map(link => ({
      source: link[0],
      target: link[1],
      value: strokeScale(link[2]),
    }));

    const nodeTitles = artistsArr.map(artist => artist[0]);

    const nodeScale = 4;
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

    const link = vis
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => d.value);

    const node = vis
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

    node.append('title').text(d => d.name);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = nodes.length > 19 ? nodes[19].radius : 0;
    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        return d.name;
      })
      .attr('x', function(d) {
        return -2.5 * (1 + d.name.length);
      })
      .attr('y', 3)
      .style('font-size', '12px')
      .style('visibility', d =>
        d.radius > radiusLimit ? 'visible' : 'hidden'
      );

    const tooltip = d3
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
      this.setState({
        clickedOnArtist: true,
        id: d.id,
        name: d.name,
      });
    });

    simulation.on('tick', () => {
      // ## this code makes nodes bounded in the panel
      // node
      //   .attr('cx', function(d) {
      //     return (d.x = Math.max(
      //       nodeScale * d.radius + 20,
      //       Math.min(canvasWidth - 20 - nodeScale * d.radius, d.x)
      //     ));
      //   })
      //   .attr('cy', function(d) {
      //     return (d.y = Math.max(
      //       nodeScale * d.radius + 20,
      //       Math.min(canvasHeight - 20 - nodeScale * d.radius, d.y)
      //     ));
      //   })
      //   .attr('transform', function(d) {
      //     return 'translate(' + d.x + ',' + d.y + ')';
      //   });

      // ## this code makes nodes NOT bounded in the panel
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('transform', function(d) {
          return `translate(${d.x},${d.y})`;
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
        .style('visibility', d =>
          d.radius > radiusLimit ? 'visible' : 'hidden'
        );
    });
  }

  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.nodeMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnArtist === true) {
      console.log('redirecting');
      return <Redirect push to={`/overview/artist/${this.state.id}`} />;
    }
    return <div ref="canvas" />;
  }
}

export default BarChart;
