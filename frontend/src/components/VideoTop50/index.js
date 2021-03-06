import * as d3 from 'd3';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getVideoInfo } from '../VideoEgo/popout';

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

let vis;
class BarChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
    };
  }

  componentDidMount() {
    const oWidth = document.getElementById('headerBar').offsetWidth - 50;
    this.drawSongExample(oWidth);
  }

  drawSongExample(oWidth) {
    const songsArr = this.props.videos;
    const linksArr = this.props.links.filter(link => link[1] !== null);

    const canvasHeight = oWidth / 2;
    const canvasWidth = oWidth;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 130;
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
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 15;
    const minRadius = 3;
    const minViews = d3.min(viewsList);
    const maxViews = d3.max(viewsList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const nodeScale = 4;
    const inDegreeList = songsArr.map(d => d[3]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolatePuBu)
      .domain([minInDegree, maxInDegree + 5]);

    const nodes = songsArr.map(video => ({
      id: video[0],
      name: video[1],
      radius: radiusScale(video[2]),
      colour: colourScale(video[3]),
      video: video,
    }));

    let links = linksArr.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    const nodeTitles = songsArr.map(song => song[0]);
    const filteredLinks = [];
    const loops = links.length;
    for (let i = 0; i < loops; i++) {
      let found = false;
      const checking = links.shift();
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
          .strength(0.05)
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
      .force('charge', d3.forceManyBody().strength(-80))
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

    node.append('title').text(d => d.id);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = nodes.length > 19 ? nodes[19].radius : 0;
    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        return d.name;
      })
      .attr('x', function(d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('font-size', '12px')
      .style('visibility', d =>
        d.radius > radiusLimit ? 'visible' : 'hidden'
      );

    const tooltip = d3
      .select('#graphContainer')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('left', '0px')
      .style('bottom', '-350px')
      .style('width', '460px')
      .style('visibility', 'hidden');

    node.on('click', d => {
      this.setState({
        clickedOnSong: true,
        title: d.name,
      });
    });

    node.on('mouseover', function(d) {
      d3.select(this)
        .style('stroke', 'black')
        .raise()
        .select('text')
        .style('visibility', 'visible');
      tooltip.html('');
      tooltip.style('visibility', 'visible');
      console.log(d);
      console.log('erroe');
      getVideoInfo(d, tooltip);
    });

    node.on('mouseleave', function() {
      tooltip.style('visibility', 'hidden');
      d3.select(this)
        .style('stroke', 'none')
        .select('text')
        .style('visibility', d =>
          d.radius > radiusLimit ? 'visible' : 'hidden'
        );
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
  }

  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.nodeMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      console.log(this.state);
      return <Redirect push to={`/overview/video/${this.state.videoId}`} />;
    }
    return <div ref="canvas" />;
  }
}

export default BarChart;
