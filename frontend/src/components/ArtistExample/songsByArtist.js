import * as d3 from 'd3';
import axios from 'axios';

import { getSongInfo } from '../SongExample/popout';

export function getSongsByArtist(
  artist,
  canvasWidth,
  canvasHeight,
  svg,
  drag,
  tooltip
) {
  const options = {
    params: {
      artist: artist,
    },
  };
  axios
    .get('/vevo/songs_by_artist/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        let songs = res.data.songs;
        let songLinks = res.data.songLinks;
        drawSongsByArtist(
          songs,
          songLinks,
          canvasWidth,
          canvasHeight,
          svg,
          drag,
          tooltip
        );
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function drawSongsByArtist(
  songs,
  songLinks,
  canvasWidth,
  canvasHeight,
  svg,
  drag,
  tooltip
) {
  let linksArr = songLinks.filter(song => song[1] !== null);

  let connectedLinks = [];
  const loops = linksArr.length;
  for (let i = 0; i < loops; i++) {
    let found = false;
    let checking = linksArr.shift();
    for (let j = 0; j < connectedLinks.length; j++) {
      if (
        connectedLinks[j][1] === checking[0] &&
        connectedLinks[j][0] === checking[1]
      ) {
        found = true;
        connectedLinks[j][2] += checking[2];
        break;
      }
    }
    if (!found) {
      connectedLinks.push(checking);
    }
  }

  //Connection weight
  const strokeList = connectedLinks.map(song => song[2]);
  const minStroke = 0.5;
  const maxStroke = 5;
  const minWeight = d3.min(strokeList);
  const maxWeight = d3.max(strokeList);
  const strokeScale = d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([minStroke, maxStroke]);

  //In-Degree
  const radiusList = songs.map(d => d[2]);
  const maxRadius = 10;
  const minRadius = 3;
  const minViews = d3.min(radiusList);
  const maxViews = d3.max(radiusList);
  const radiusScale = d3
    .scaleLinear()
    .domain([minViews, maxViews])
    .range([minRadius, maxRadius]);

  //Views
  const colourList = songs.map(d => d[1]);
  const minColour = '#c38aff';
  const maxColour = '#5600b0';
  const minInDegree = d3.min(colourList);
  const maxInDegree = d3.max(colourList);
  const colourScale = d3
    .scaleLinear()
    .domain([minInDegree, maxInDegree])
    .range([minColour, maxColour]);

  const nodes = songs.map(genre => ({
    id: genre[0],
    radius: radiusScale(genre[2]),
    colour: colourScale(genre[1]),
  }));

  let links = connectedLinks.map(video => ({
    source: video[0],
    target: video[1],
    value: strokeScale(video[2]),
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
    .force('charge', d3.forceManyBody().strength(-50))
    .force('center', d3.forceCenter((canvasWidth / 5) * 1, canvasHeight / 2))
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
      return d.id.split('_').join(' ');
    })
    .attr('x', 6)
    .attr('y', 3)
    .style('font-size', '10px');

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

  node.on('click', d => {
    tooltip.style('visibility', 'visible');
    getSongInfo(d, tooltip);
  });
}
