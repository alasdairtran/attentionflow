import axios from 'axios';
import * as d3 from 'd3';

export function getIncomingOutgoing(
  genre,
  canvasHeight,
  canvasWidth,
  verticalMargin,
  horizontalMargin,
  drag,
  svg
) {
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
        let central = res.data.central;
        drawIncomingOutgoing(
          incoming,
          outgoing,
          central,
          canvasHeight,
          canvasWidth,
          verticalMargin,
          horizontalMargin,
          drag,
          svg
        );
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
  canvasHeight,
  canvasWidth,
  verticalMargin,
  horizontalMargin,
  drag,
  svg
) {
  let incoming = incomingUnchecked[0][0] === null ? [] : incomingUnchecked;
  let outgoing = outgoingUnchecked[0][0] === null ? [] : outgoingUnchecked;

  incoming.sort();
  outgoing.sort();

  const vidList = incoming.concat(outgoing);
  const inLength = incoming.length;
  const outLength = outgoing.length;

  const minWeight = d3.min(vidList.map(videoData => videoData[2]));
  const maxWeight = d3.max(vidList.map(videoData => videoData[2]));
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
    radius: radiusScale(video[2]),
    colour:
      video[1] < title[1]
        ? colourScaleLessViews(video[1])
        : colourScaleMoreViews(video[1]),
    type: 'I',
  }));

  nodes.push(
    ...outgoing.map(video => ({
      id: video[0],
      radius: radiusScale(video[2]),
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
      return d.id.split('_').join(' ');
    })
    .attr('text-anchor', d =>
      d.type === 'I' ? 'end' : d.type === 'O' ? 'start' : 'middle'
    )
    .attr('x', d => (d.type === 'I' ? -6 : d.type === 'O' ? 6 : 0))
    .attr('y', d => (d.type === 'C' ? -15 : 3))
    .style('font-size', '10px');

  node.on('click', d => {
    node.remove();
    getIncomingOutgoing(
      d.id,
      canvasHeight,
      canvasWidth,
      verticalMargin,
      horizontalMargin,
      drag,
      svg
    );
  });

  simulation.on('tick', () => {
    node.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  });
}
