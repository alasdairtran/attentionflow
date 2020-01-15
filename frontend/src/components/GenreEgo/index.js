import React, { Component } from 'react';
import * as d3 from 'd3';
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
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    this.drawBarChart(oWidth);
  }

  drawBarChart(oWidth) {
    const canvasHeight = oWidth / 2;
    const canvasWidth = oWidth;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 130;
    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    const strokeList = this.props.genres.map(genre => genre[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const nodes = this.props.genres.map(genre => ({
      id: genre[0],
      radius: 15,
      colour: 'purple',
    }));

    const links = this.props.genres.map(genre => ({
      source: genre[0],
      target: genre[1],
      value: strokeScale(genre[2]),
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .strength(0.1)
      )
      .force(
        'collide',
        d3
          .forceCollide()
          .radius(function(d) {
            return d.radius + 1.5;
          })
          .iterations(2)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(canvasWidth / 2, canvasHeight / 2))
      .force('x', d3.forceX(0.0002))
      .force('y', d3.forceY(0.0001));

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
      .attr('r', d => 2 * d.radius)
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

    let tooltip = d3
      .select(this.refs.canvas)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('top', '150px')
      .style('left', '0px')
      .style('width', '460px')
      .style('visibility', 'hidden');

    node.on('click', d => {
      tooltip.style('visibility', 'hidden');
      node.remove();
      link.remove();
      getEgo(d.id);
    });

    function getEgo(genre) {
      const options = {
        params: {
          genre: genre,
        },
      };
      axios
        .get('/vevo/genre_ego/', options)
        .then(res => {
          if (res.data.error) {
            console.log('error');
          } else {
            let incoming = res.data.incoming;
            let outgoing = res.data.outgoing;
            let central = res.data.centre;
            drawEgoGraph(incoming, outgoing, central);
          }
        })
        .catch(function(error) {
          console.error(error);
        });
    }

    function drawEgoGraph(incomingUnchecked, outgoingUnchecked, title) {
      const incoming =
        incomingUnchecked[0][0] === null ? [] : incomingUnchecked;
      const outgoing =
        outgoingUnchecked[0][0] === null ? [] : outgoingUnchecked;
      const vidList = incoming.concat(outgoing);
      const inLength = incoming.length;
      const outLength = outgoing.length;

      const minWeight = d3.min(vidList.map(videoData => videoData[1]));
      const maxWeight = d3.max(vidList.map(videoData => videoData[1]));
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

      const nodes = incoming.map(video => ({
        id: video[0],
        radius: radiusScale(video[1]),
        colour: 'rgb(128,128,128)',
        type: 'I',
      }));

      nodes.push(
        ...outgoing.map(video => ({
          id: video[0],
          radius: radiusScale(video[1]),
          colour: 'rgb(128,128,128)',
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
        node.remove();
        link.remove();
        getEgo(d.id);
      });

      node.on('mouseover', function(d) {
        d3.select(this).style('stroke', 'black');
      });

      node.on('mouseleave', function() {
        d3.select(this).style('stroke', 'none');
      });

      simulation.on('tick', () => {
        node.attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
      });
    }
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
