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
    this.drawBarChart();
  }

  drawBarChart() {
    const canvasHeight = 600;
    const canvasWidth = 800;
    const horizontalMargin = canvasWidth / 2 - 100;
    const verticalMargin = 130;
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

    node.append('title').text(d => d.id);

    node
      .append('text')
      .text(function(d) {
        return d.id;
      })
      .attr('x', 6)
      .attr('y', 3)
      .style('font-size', '10px');

    const title = svg
      .append('text')
      .attr('x', canvasWidth / 2)
      .attr('y', 50)
      .text(this.props.title[0]);

    node.on('click', d => {
      node.remove();
      link.remove();
      title.remove();
      getEgo(d.id);
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

    function getEgo(title) {
      const options = {
        params: {
          title: title,
        },
      };
      axios
        .get('/vevo/ego/', options)
        .then(res => {
          if (res.data.error) {
            console.log('error');
          } else {
            let incoming = res.data.incoming;
            let outgoing = res.data.outgoing;
            let central = res.data.title;
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

      const egoTitle = svg
        .append('text')
        .attr('x', canvasWidth / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .text(title[0]);

      node.on('click', d => {
        node.remove();
        egoTitle.remove();
        getEgo(d.id);
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
