import axios from 'axios';
import * as d3 from 'd3';
import { drag } from '../Helper/helper';
import { getArtistEgo } from './artistEgo';
import { getVideosByArtist } from './videosByArtist';

export function getIncomingOutgoing(artist, oWidth) {
  d3.select('#graphContainer3').html('');
  d3.select('#graphContainer3')
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
      artist,
    },
  };
  axios
    .get('/vevo/artist_incoming_outgoing/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        const { central } = res.data;
        const { incoming } = res.data;
        const { outgoing } = res.data;
        d3.select('#graphContainer3').html('');
        drawIncomingOutgoing(incoming, outgoing, central, oWidth);
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function drawIncomingOutgoing(
  incomingUnchecked,
  outgoingUnchecked,
  title,
  oWidth
) {
  const canvasWidth = oWidth;
  const canvasHeight = oWidth * 0.6;
  const verticalMargin = 100;

  const svg = d3
    .select('#graphContainer3')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

  const incoming = incomingUnchecked[0][0] === null ? [] : incomingUnchecked;
  const outgoing = outgoingUnchecked[0][0] === null ? [] : outgoingUnchecked;

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

  const minViews = d3.min(vidList.map(videoData => videoData[2]));
  const maxViews = d3.max(vidList.map(videoData => videoData[2]));
  const minColour = '#0054FF';
  const maxColour = '#FFAB00';
  const neutralColour = '#808080';
  const maxDifference = Math.max(title[2] - minViews, maxViews - title[2]);
  const colourScale = d3
    .scaleLinear()
    .domain([title[2] - maxDifference, title[2] + maxDifference])
    .range([minColour, maxColour]);
  const colourScaleLessViews = d3
    .scaleLinear()
    .domain([minViews, title[2]])
    .range([minColour, neutralColour]);
  const colourScaleMoreViews = d3
    .scaleLinear()
    .domain([title[2], maxViews])
    .range([neutralColour, maxColour]);

  const nodes = incoming.map(video => ({
    name: video[0],
    id: video[1],
    radius: radiusScale(video[2]),
    colour:
      video[2] < title[2]
        ? colourScaleLessViews(video[2])
        : colourScaleMoreViews(video[2]),
    type: 'I',
  }));

  nodes.push(
    ...outgoing.map(video => ({
      name: video[0],
      id: video[1],
      radius: radiusScale(video[3]),
      colour:
        video[2] < title[2]
          ? colourScaleLessViews(video[2])
          : colourScaleMoreViews(video[2]),
      type: 'O',
    }))
  );
  nodes.push({
    name: title[0],
    id: title[1],
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
          return 300;
        }
        if (d.type === 'O') {
          return canvasWidth - 300;
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
      return d.name;
    })
    .attr('text-anchor', d =>
      d.type === 'I' ? 'end' : d.type === 'O' ? 'start' : 'middle'
    )
    .attr('x', d => (d.type === 'I' ? -6 : d.type === 'O' ? 6 : 0))
    .attr('y', d => (d.type === 'C' ? -15 : 3))
    .style('font-size', '10px');

  svg
    .append('text')
    .text('Incoming')
    .attr('x', 300)
    .attr('y', verticalMargin / 2)
    .attr('text-anchor', 'end');

  svg
    .append('text')
    .text('Outgoing')
    .attr('x', canvasWidth - 300)
    .attr('y', verticalMargin / 2)
    .attr('text-anchor', 'start');

  let sumIn = 0;
  incoming.forEach(node => (sumIn += node[3]));
  let sumOut = 0;
  outgoing.forEach(node => (sumOut += node[3]));

  let inMargin = verticalMargin;
  let outMargin = verticalMargin;
  if (sumIn > sumOut) {
    outMargin =
      canvasHeight / 2 - ((canvasHeight / 2 - verticalMargin) * sumOut) / sumIn;
  } else {
    inMargin =
      canvasHeight / 2 - ((canvasHeight / 2 - verticalMargin) * sumIn) / sumOut;
  }

  svg
    .append('polygon')
    .style('fill', 'grey')
    .attr(
      'points',
      `300,${inMargin} 300,${canvasHeight - inMargin} ${canvasWidth /
        2},${canvasHeight / 2}`
    )
    .lower()
    .style('opacity', '20%');

  svg
    .append('polygon')
    .style('fill', 'grey')
    .attr(
      'points',
      `${canvasWidth - 300},${outMargin} ${canvasWidth - 300},${canvasHeight -
        outMargin} ${canvasWidth / 2},${canvasHeight / 2}`
    )
    .lower()
    .style('opacity', '20%');

  node.on('click', d => {
    svg.remove();
    d3.select('#titleBar').html(d.name);
    const oWidth = document.getElementById('headerBar').offsetWidth - 50;
    getArtistEgo(d.id, oWidth, 1);
    getVideosByArtist(d.id, oWidth);
    getIncomingOutgoing(d.id, oWidth);
  });

  simulation.on('tick', () => {
    node.attr('transform', function(d) {
      return `translate(${d.x},${d.y})`;
    });
  });
}
