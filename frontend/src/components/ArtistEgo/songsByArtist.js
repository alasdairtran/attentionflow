import * as d3 from 'd3';
import axios from 'axios';

import { getSongInfo } from '../SongEgo/popout';
import { getIncomingOutgoing } from '../SongEgo/incomingOutgoing';
import { getSongEgo } from '../SongEgo/songEgo';

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

export function getSongsByArtist(artist, oWidth) {
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
        d3.select('#graphContainer2').html('');
        drawSongsByArtist(songs, songLinks, oWidth);
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function drawSongsByArtist(songs, songLinks, oWidth) {
  const canvasWidth = oWidth;
  const canvasHeight = oWidth / 2;

  const svg = d3
    .select('#graphContainer2')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

  let tooltip = d3
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
    .style('visibility', 'hidden')
    .on('click', () => tooltip.style('visibility', 'hidden').html(''));

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

  const strokeList = connectedLinks.map(song => song[2]);
  const minStroke = 0.5;
  const maxStroke = 5;
  const minWeight = d3.min(strokeList);
  const maxWeight = d3.max(strokeList);
  const strokeScale = d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([minStroke, maxStroke]);

  const radiusList = songs.map(d => d[2]);
  const maxRadius = 15;
  const minRadius = 3;
  const minViews = d3.min(radiusList);
  const maxViews = d3.max(radiusList);
  const radiusScale = d3
    .scaleLinear()
    .domain([minViews, maxViews])
    .range([minRadius, maxRadius]);

  const nodeScale = 4;
  const colourList = songs.map(d => d[1]);
  const minInDegree = d3.min(colourList);
  const maxInDegree = d3.max(colourList);
  const colourScale = d3
    .scaleSequential(d3.interpolatePuBu)
    .domain([minInDegree, maxInDegree + 5]);

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
    .force('charge', d3.forceManyBody().strength(-100))
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
    .attr('r', d => nodeScale * d.radius)
    .attr('fill', d => d.colour)
    .attr('stroke', '#ccc')
    .attr('stroke-width', 3);

  node.append('title').text(d => d.id);

  node
    .append('text')
    .call(drag(simulation))
    .text(function(d) {
      return d.id;
    })
    .attr('x', function(d) {
      return -2.5 * (1 + d.id.length);
    })
    .attr('y', 3)
    .style('font-size', '12px')
    .style('visibility', d => (d.radius > 8 ? 'visible' : 'hidden'));

  simulation.on('tick', () => {
    node
      .attr('cx', function(d) {
        return (d.x = Math.max(
          nodeScale * d.radius + 20,
          Math.min(canvasWidth - 20 - nodeScale * d.radius, d.x)
        ));
      })
      .attr('cy', function(d) {
        return (d.y = Math.max(
          nodeScale * d.radius + 20,
          Math.min(canvasHeight - 20 - nodeScale * d.radius, d.y)
        ));
      })
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  });

  node.on('mouseover', function(d) {
    d3.select(this)
      .style('stroke', 'black')
      .raise()
      .select('text')
      .style('visibility', 'visible');
    tooltip.html('');
    tooltip.style('visibility', 'visible');
    getSongInfo(d, tooltip);
  });

  node.on('mouseleave', function() {
    tooltip.style('visibility', 'hidden');
    d3.select(this)
      .style('stroke', 'none')
      .select('text')
      .style('visibility', d => (d.radius > 8 ? 'visible' : 'hidden'));
  });

  node.on('click', d => {
    svg.remove();
    d3.select('#tab3Button').style('visibility', 'hidden');
    d3.select('#titleBar').html(d.id);
    getSongEgo(d.id, oWidth);
    getIncomingOutgoing(d.id, oWidth);
  });
}
