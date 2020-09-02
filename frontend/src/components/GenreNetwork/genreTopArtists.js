import axios from 'axios';
import * as d3 from 'd3';
import { getArtistEgo } from '../ArtistEgo/artistEgo';
import { getIncomingOutgoing } from '../ArtistEgo/incomingOutgoing';
import { getVideosByArtist } from '../ArtistEgo/videosByArtist';

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

export function getGenreTopArtists(genre, oWidth) {
  d3.select('#graphContainer').html('');
  d3.select('#graphContainer')
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
      genre,
    },
  };
  axios
    .get('/vevo/genre_top_50_artists/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        const { artists } = res.data;
        const { links } = res.data;
        d3.select('#graphContainer').html('');
        drawGenreTopArtists(artists, links, oWidth);
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function drawGenreTopArtists(artistsArrUnchecked, linksUnfiltered, oWidth) {
  const artistsArr =
    artistsArrUnchecked[0][0] === null ? [] : artistsArrUnchecked;
  const artistNames = artistsArr.map(artist => artist[0]);
  const linksArr =
    linksUnfiltered[0] === null
      ? []
      : linksUnfiltered.filter(
          link => link[1] !== null && artistNames.includes(link[1])
        );
  const len = linksArr.length;
  const filteredLinksArr = [];
  for (let i = 0; i < len; i++) {
    const checking = linksArr.shift();
    let duplicate = false;
    for (let j = 0; j < linksArr.length; j++) {
      if (checking[0] === linksArr[j][0] && checking[1] === linksArr[j][1]) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) {
      let found = false;
      for (let j = 0; j < filteredLinksArr.length; j++) {
        if (
          checking[0] === filteredLinksArr[j][1] &&
          checking[1] === filteredLinksArr[j][0]
        ) {
          filteredLinksArr[j][2] += checking[2];
          found = true;
          break;
        }
      }
      if (!found) {
        filteredLinksArr.push(checking);
      }
    }
  }

  const canvasHeight = oWidth / 2;
  const canvasWidth = oWidth;
  const svg = d3
    .select('#graphContainer')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

  const strokeList = linksArr.map(link => link[2]);
  const minStroke = 0.5;
  const maxStroke = 5;
  const minWeight = d3.min(strokeList);
  const maxWeight = d3.max(strokeList);
  const strokeScale = d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([minStroke, maxStroke]);

  const viewsList = artistsArr.map(d => d[1]);
  const maxRadius = 15;
  const minRadius = 3;
  const minViews = d3.min(viewsList);
  const maxViews = d3.max(viewsList);
  const radiusScale = d3
    .scaleLinear()
    .domain([minViews, maxViews])
    .range([minRadius, maxRadius]);

  const nodeScale = 4;
  const inDegreeList = artistsArr.map(d => d[2]);
  const minInDegree = d3.min(inDegreeList);
  const maxInDegree = d3.max(inDegreeList);
  const colourScale = d3
    .scaleSequential(d3.interpolateYlGnBu)
    .domain([minInDegree, maxInDegree + 5]);

  const nodes = artistsArr.map(video => ({
    id: video[0],
    radius: radiusScale(video[1]),
    colour: colourScale(video[2]),
  }));

  const links = filteredLinksArr.map(video => ({
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
    .force('charge', d3.forceManyBody().strength(-1500))
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

  nodes.sort((a, b) => a.radius - b.radius);
  const radiusLimit = nodes.length > 19 ? nodes[19].radius : 0;
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
    .style('visibility', d => (d.radius > radiusLimit ? 'visible' : 'hidden'));

  const tooltip = d3
    .select('#graphContainer')
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
    d3.select('#tab1Button').style('display', 'inline');
    d3.select('#tab2Button').style('display', 'inline');
    d3.select('#tab3Button').style('display', 'inline');
    svg.remove();
    tooltip.style('visibility', 'hidden');
    d3.select('#titleBar').html(d.id);
    const oWidth = document.getElementById('headerBar').offsetWidth - 50;
    getArtistEgo(d.id, oWidth, 1);
    getVideosByArtist(d.id, oWidth);
    getIncomingOutgoing(d.id, oWidth);
  });

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
