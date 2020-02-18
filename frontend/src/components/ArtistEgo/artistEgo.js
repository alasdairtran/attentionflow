import React, { Component } from 'react';

import * as d3 from 'd3';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import '../../scenes/assets/vevovis.css';

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
      clickedOnArtist: false,
      artist: null,
    };
  }

  componentDidMount() {
    let oWidth = document.getElementById('headerBar').offsetWidth - 50;
    this.getArtistEgo(oWidth);
  }

  getArtistEgo(artist, oWidth, hops) {
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
        artist,
      },
    };
    axios
      .get(
        hops === 1
          ? '/vevo/1hop_artist/'
          : hops === 2
          ? '/vevo/2hop_artist/'
          : '/vevo/3hop_artist/',
        options
      )
      .then(res => {
        if (res.data.error) {
        } else {
          drawArtistEgo(res.data.artists, res.data.links, oWidth);
          drawHopSlider(artist, oWidth, hops);
        }
      })
      .catch(function(error) {
        console.error(error);
      });

    const btns = {};
    function drawHopSlider(artist, oWidth, hops) {
      const container = document.getElementById('graphContainer');
      const div = document.createElement('div');
      div.classList.add('egohops');
      div.innerHTML = 'N-hop ego network';

      // <div role="group" class="btn-group-sm btn-group btn-group-toggle" data-toggle="buttons">
      // <label class="btn btn-primary">
      //     <input type="radio" name="options" id="option1" autocomplete="off" checked>
      //     One
      // </label>
      const btngroup = document.createElement('div');
      btngroup.role = 'group';
      btngroup.className = 'egohops-buttons btn-group';

      for (let i = 1; i <= 3; i++) {
        btns[i] = document.createElement('button');
        btns[i].className = 'egohops-label btn btn-outline-secondary';
        btns[i].textContent = `${i}`;
        btns[i].addEventListener('click', changeNumberHops);
        btngroup.appendChild(btns[i]);
      }
      btns[hops].classList.remove('btn-outline-secondary');
      btns[hops].classList.add('btn-secondary');

      div.appendChild(btngroup);
      container.appendChild(div);

      function changeNumberHops(e) {
        const selected = parseInt(this.innerHTML);
        for (let i = 1; i <= 3; i++) {
          btns[i].classList.remove('btn-secondary');
          btns[i].classList.add('btn-outline-secondary');
        }
        btns[selected].classList.remove('btn-outline-secondary');
        btns[selected].classList.add('btn-secondary');

        // ///////////////////////////////////////////
        //   DO SOMETHING when changing # of hops  //
        // ///////////////////////////////////////////
        if (selected === 1 && hops !== 1) {
          this.getArtistEgo(artist, oWidth, 1);
        } else if (selected === 2 && hops !== 2) {
          this.getArtistEgo(artist, oWidth, 2);
        } else if (selected === 3 && hops !== 3) {
          this.getArtistEgo(artist, oWidth, 3);
        }
      }
    }

    function drawArtistEgo(nodesArrUnfiltered, linksArrUnfiltered, oWidth) {
      const nodeTitles = nodesArrUnfiltered.map(node => node[0]);
      const nodesArr = nodesArrUnfiltered.filter(
        (node, index) => nodeTitles.indexOf(node[0]) === index
      );
      const filteredLinksArr = linksArrUnfiltered.filter(link =>
        nodeTitles.includes(link[1])
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
        .style('right', '0px')
        .style('top', '0px')
        .style('width', '460px')
        .style('visibility', 'hidden')
        .on('click', () => tooltip.style('visibility', 'hidden').html(''));

      const canvasHeight = oWidth * 0.6;
      const canvasWidth = oWidth;
      const verticalMargin = 30;
      const outer = d3
        .select('#graphContainer')
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
        .call(
          d3.zoom().on('zoom', function(transition) {
            (transition ? vis.transition() : vis).attr(
              'transform',
              d3.event.transform
            );
          })
        );
      vis = outer.append('g');

      const strokeList = filteredLinksArr.map(d => d[2]);
      const minStroke = 0.5;
      const maxStroke = 5;
      const minWeight = d3.min(strokeList);
      const maxWeight = d3.max(strokeList);
      const strokeScale = d3
        .scaleLinear()
        .domain([minWeight, maxWeight])
        .range([minStroke, maxStroke]);

      const radiusList = nodesArr.map(d => d[1]);
      const maxRadius = 15;
      const minRadius = 3;
      const minViews = d3.min(radiusList);
      const maxViews = d3.max(radiusList);
      const radiusScale = d3
        .scaleLinear()
        .domain([minViews, maxViews])
        .range([minRadius, maxRadius]);

      const nodeScale = 4;
      const colourList = nodesArr.map(d => d[2]);
      const minInDegree = d3.min(colourList);
      const maxInDegree = d3.max(colourList);
      const colourScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain([minInDegree, maxInDegree + 5]);

      const nodes = nodesArr.map(node => ({
        id: node[0],
        radius: radiusScale(node[1]),
        colour: colourScale(node[2]),
      }));

      let links = filteredLinksArr.map(link => ({
        source: link[0],
        target: link[1],
        value: strokeScale(link[2]),
      }));
      const setLinks = [];
      const loops = links.length;
      for (let i = 0; i < loops; i++) {
        let found = false;
        const checking = links.shift();
        for (let j = 0; j < links.length; j++) {
          if (
            ((links[j].source === checking.source &&
              links[j].target === checking.target) ||
              (links[j].source === checking.target &&
                links[j].target === checking.source)) &&
            links[j].value === checking.value
          ) {
            found = true;
            break;
          }
        }
        if (!found) {
          let found2 = false;
          for (let j = 0; j < setLinks.length; j++) {
            if (
              (setLinks[j].source === checking.source &&
                setLinks[j].target === checking.target) ||
              (setLinks[j].source === checking.target &&
                setLinks[j].target === checking.source)
            ) {
              found2 = true;
              setLinks[j].value += checking.value;
              break;
            }
          }
          if (!found2) {
            setLinks.push(checking);
          }
        }
      }

      links = setLinks;

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
        .force('charge', d3.forceManyBody().strength(-1000))
        .force(
          'center',
          d3.forceCenter((canvasWidth - 100) / 2, canvasHeight / 2)
        );

      const link = vis
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => 3 * d.value);

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
          return d.id;
        })
        .attr('x', function(d) {
          return -2.5 * (1 + d.id.length);
        })
        .attr('y', 3)
        .style('font-size', '12px')
        .style('visibility', d =>
          d.radius > radiusLimit ? 'visible' : 'hidden'
        );

      node.on('click', d => {
        this.setState({
          clickedOnArtist: true,
          artist: d.id,
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
  }

  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.nodeMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnAritst === true) {
      console.log('redirecting');
      return <Redirect push to={`/overview/artist/${this.state.artist}`} />;
    }
    return <div ref="canvas"></div>;
  }
}

export default BarChart;
