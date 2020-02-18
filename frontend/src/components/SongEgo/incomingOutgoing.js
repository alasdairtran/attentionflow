import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import { getSongInfo } from './popout';

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

var vis;
class BarChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
    };
  }

  componentDidMount() {
    let oWidth = document.getElementById('headerBar').offsetWidth - 50;
    this.drawSongExample(oWidth);
  }

  getIncomingOutgoing(title, oWidth) {
    d3.select('#graphContainer2').html('');
    d3.select('#graphContainer2')
      .append('div')
      .style('width', '50px')
      .style('height', '50px')
      .style('border', '10px solid #f3f3f3')
      .style('border-radius', '50%')
      .style('border-top', '10px solid #3498db')
      .style('animation', 'spin 2s linear infinite')
      .style('margin', '100px auto');
    const options = {
      params: {
        title,
      },
    };
    axios
      .get('/vevo/song_incoming_outgoing/', options)
      .then(res => {
        if (res.data.error) {
          console.log('error');
        } else {
          const { incoming } = res.data;
          const { outgoing } = res.data;
          const central = res.data.title;
          d3.select('#graphContainer2').html('');
          drawIncomingOutgoing(incoming, outgoing, central, oWidth);
        }
      })
      .catch(function(error) {
        console.error(error);
      });
    function drawIncomingOutgoing(
      incomingUnchecked,
      outgoingUnchecked,
      title,
      oWidth
    ) {
      const incoming =
        incomingUnchecked[0][0] === null ? [] : incomingUnchecked;
      const outgoing =
        outgoingUnchecked[0][0] === null ? [] : outgoingUnchecked;
      const horizontalMargin = 300;
      const canvasHeight = oWidth / 2;
      const canvasWidth = oWidth;
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

      const tooltip = d3
        .select('#graphContainer2')
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

      incoming.sort();
      outgoing.sort();

      const vidList = incoming.concat(outgoing);
      const inLength = incoming.length;
      const outLength = outgoing.length;

      const minWeight = d3.min(vidList.map(videoData => videoData[3]));
      const maxWeight = d3.max(vidList.map(videoData => videoData[3]));
      const maxRadius = Math.min(
        (canvasHeight - verticalMargin * 2) /
          Math.max(incoming.length, outgoing.length) /
          2,
        15
      );
      const minRadius = Math.min(3, maxRadius / 4);
      const radiusScale = d3
        .scaleLinear()
        .domain([minWeight, maxWeight])
        .range([minRadius, maxRadius]);

      vidList.push(title);

      const minViews = d3.min(vidList.map(videoData => videoData[1]));
      const maxViews = d3.max(vidList.map(videoData => videoData[1]));
      const minColour = '#0054FF';
      const maxColour = '#FFAB00';
      const neutralColour = '#808080';
      const maxDifference = Math.max(title[1] - minViews, maxViews - title[1]);
      const colourScale = d3
        .scaleLinear()
        .domain([title[1] - maxDifference, title[1] + maxDifference])
        .range([minColour, maxColour]);
      const colourScaleLessViews = d3
        .scaleLinear()
        .domain([minViews, title[1]])
        .range([minColour, neutralColour]);
      const colourScaleMoreViews = d3
        .scaleLinear()
        .domain([title[1], maxViews])
        .range([neutralColour, maxColour]);

      const nodes = incoming.map(video => ({
        id: video[0],
        radius: radiusScale(video[3]),
        colour:
          video[1] < title[1]
            ? colourScaleLessViews(video[1])
            : colourScaleMoreViews(video[1]),
        type: 'I',
      }));

      nodes.push(
        ...outgoing.map(video => ({
          id: video[0],
          radius: radiusScale(video[3]),
          colour:
            video[1] < title[1]
              ? colourScaleLessViews(video[1])
              : colourScaleMoreViews(video[1]),
          type: 'O',
        }))
      );
      nodes.push({
        id: title[0],
        radius: (maxRadius + minRadius) / 2,
        colour: 'rgb(128,128,128)',
        type: 'C',
      });

      const simulation = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(0))
        .force(
          'x',
          d3.forceX().x(function(d) {
            if (d.type === 'I') {
              return horizontalMargin;
            }
            if (d.type === 'O') {
              return canvasWidth - horizontalMargin;
            }
            return canvasWidth / 2;
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
            }
            if (d.type === 'O') {
              return outLength === 1
                ? canvasHeight / 2
                : ((canvasHeight - verticalMargin * 2) / (outLength - 1)) *
                    (i - inLength) +
                    verticalMargin;
            }
            return canvasHeight / 2;
          })
        );

      const node = vis
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

      node
        .append('text')
        .text(function(d) {
          return d.id;
        })
        .attr('text-anchor', d =>
          d.type === 'I' ? 'end' : d.type === 'O' ? 'start' : 'middle'
        )
        .attr('x', d => (d.type === 'I' ? -6 : d.type === 'O' ? 6 : 0))
        .attr('y', d => (d.type === 'C' ? -15 : 3))
        .style('font-size', '10px');

      node.on('click', d => {
        this.setState({
          clickedOnSong: true,
          title: d.id,
        });
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

      vis
        .append('text')
        .text('Incoming')
        .attr('x', 300)
        .attr('y', verticalMargin / 2)
        .attr('text-anchor', 'end');

      vis
        .append('text')
        .text('Outgoing')
        .attr('x', canvasWidth - 300)
        .attr('y', verticalMargin / 2)
        .attr('text-anchor', 'start');

      let sumIn = 0;
      incoming.forEach(node => (sumIn += node[1]));
      let sumOut = 0;
      outgoing.forEach(node => (sumOut += node[1]));

      let inMargin = verticalMargin;
      let outMargin = verticalMargin;
      if (sumIn > sumOut) {
        outMargin =
          canvasHeight / 2 -
          ((canvasHeight / 2 - verticalMargin) * sumOut) / sumIn;
      } else {
        inMargin =
          canvasHeight / 2 -
          ((canvasHeight / 2 - verticalMargin) * sumIn) / sumOut;
      }

      vis
        .append('polygon')
        .style('fill', 'grey')
        .attr(
          'points',
          `300,${inMargin} 300,${canvasHeight - inMargin} ${canvasWidth /
            2},${canvasHeight / 2}`
        )
        .lower()
        .style('opacity', '20%');

      vis
        .append('polygon')
        .style('fill', 'grey')
        .attr(
          'points',
          `${canvasWidth - 300},${outMargin} ${canvasWidth -
            300},${canvasHeight - outMargin} ${canvasWidth / 2},${canvasHeight /
            2}`
        )
        .lower()
        .style('opacity', '20%');

      simulation.on('tick', () => {
        node.attr('transform', function(d) {
          return `translate(${d.x},${d.y})`;
        });
      });
    }
  }
  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.nodeMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      return <Redirect push to={`/overview/song/${this.state.title}`} />;
    }
    return <div ref="canvas"></div>;
  }
}
export default BarChart;
