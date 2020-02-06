import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import SongEgo from '../SongEgo';
import { getSongEgo } from '../SongEgo/songEgo';
import { getIncomingOutgoing } from '../SongEgo/incomingOutgoing';

class GenreBubbles extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('graphContainerBubbles').offsetWidth;
    this.drawGenreBubbles(oWidth);
  }

  drawGenreBubbles(oWidth) {
    let bubblesInfo = this.props.bubblesInfo;
    let root = JSON.parse(JSON.stringify(bubblesInfo));
    root.children.forEach(genreObject => {
      genreObject.children.forEach(artistObject => {
        artistObject.children = artistObject.children
          .slice(0, Math.floor(artistObject.name[1] / 2000000000) + 1)
          .map(songObject => ({
            name: songObject.name[0],
            size: songObject.size,
          }));
      });
    });
    root.children.forEach(genreObject => {
      genreObject.children.forEach(artistObject => {
        artistObject.name = artistObject.name[0];
      });
    });

    let color = d3.scaleSequential(d3.interpolateGnBu).domain([-1, 5]);

    let diameter = oWidth;

    let svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', oWidth)
      .attr('height', oWidth)
      .attr('class', 'bubble');

    let g = svg
      .append('g')
      .attr(
        'transform',
        'translate(' + oWidth / 2 + ',' + (diameter / 2 + 10) + ')'
      );

    let pack = d3
      .pack()
      .size([diameter, diameter])
      .padding(3);

    root = d3
      .hierarchy(root)
      .sum(function(d) {
        return d.size;
      })
      .sort(function(a, b) {
        return b.value - a.value;
      });

    let focus = root,
      nodes = pack(root).descendants(),
      view;

    let circle = g
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', function(d) {
        return d.parent
          ? d.children
            ? 'node'
            : 'node node--leaf'
          : 'node node--root';
      })
      .style('fill', function(d) {
        if (d == root) return 'transparent';
        return d.children ? color(d.depth) : null;
      })
      .on('click', function(d) {
        if (focus !== d) {
          focus = d;
          zoom(d);
        } else {
          if (d !== root) {
            focus = d.parent;
            zoom(d.parent);
          }
        }
      })
      .style('cursor', 'pointer')
      .style('stroke', 'black')
      .style('stroke-width', '0px')
      .on('mouseover', function(d) {
        if (focus === d.parent || focus.parent === d || focus === d) {
          d3.select('#bubblesInfo1').html('');
          d3.select('#bubblesInfo2').html('');
          d3.select('#bubblesInfo3').html('');
          circle.style('stroke-width', '0px');

          if (d !== root) {
            d3.select(this).style('stroke-width', '1.5px');
            d3.select('#bubblesInfo1')
              .append('h5')
              .text(d.data.name.split('_').join(' '));
            //Genre Info
            if (d.depth === 1) {
              let topArtists = [];
              bubblesInfo.children.forEach(genreObject => {
                if (genreObject.name === d.data.name) {
                  topArtists = genreObject.children
                    .slice(0, 5)
                    .map(artistObject => artistObject.name[0]);
                }
              });
              d3.select('#bubblesInfo2')
                .append('h6')
                .html('Top Artists');
              d3.select('#bubblesInfo2')
                .append('ol')
                .selectAll('li')
                .data(topArtists)
                .enter()
                .append('li')
                .html(d => d)
                .style('text-align', 'left');
              let topSongs = [];
              bubblesInfo.children.forEach(genreObject => {
                if (genreObject.name === d.data.name) {
                  let songsList = [];
                  genreObject.children.forEach(artistObject => {
                    songsList.push(...artistObject.children);
                  });

                  songsList.sort(function(a, b) {
                    return b.size - a.size;
                  });
                  topSongs = songsList.slice(0, 5);
                }
              });
              d3.select('#bubblesInfo3')
                .append('h6')
                .html('Top Songs');
              d3.select('#bubblesInfo3')
                .append('ol')
                .selectAll('li')
                .data(topSongs)
                .enter()
                .append('li')
                .html(d => d.name[0])
                .style('text-align', 'left');
            }
            //Artist Info
            else if (d.depth === 2) {
              let topSongs = [];
              bubblesInfo.children.forEach(genreObject => {
                if (genreObject.name === d.parent.data.name) {
                  genreObject.children.forEach(artistObject => {
                    if (artistObject.name[0] === d.data.name) {
                      topSongs = artistObject.children
                        .slice(0, 5)
                        .map(songObject => songObject.name[0]);
                    }
                  });
                }
              });
              d3.select('#bubblesInfo2')
                .append('h6')
                .html('Top Songs');
              d3.select('#bubblesInfo2')
                .append('ol')
                .selectAll('li')
                .data(topSongs)
                .enter()
                .append('li')
                .html(d => d)
                .style('text-align', 'left');
            }
            //Song Info
            else if (d.depth === 3) {
              d3.select('#bubblesInfo2')
                .append('h6')
                .html('Total Views');
              d3.select('#bubblesInfo2')
                .append('p')
                .html(d3.format(',')(d.data.size));
              d3.select('#bubblesInfo3').html(
                '<p>Daily Views</p>' + "<div id = 'dailyViewsGraph' />"
              );

              let graphWidth =
                document.getElementById('bubblesInfo3').offsetWidth - 40;
              let graphHeight = 120;
              let viewsArray = [];
              bubblesInfo.children.forEach(genreObject => {
                if (genreObject.name === d.parent.parent.data.name) {
                  genreObject.children.forEach(artistObject => {
                    if (artistObject.name[0] === d.parent.data.name) {
                      artistObject.children.forEach(songObject => {
                        if (songObject.name[0] === d.data.name)
                          viewsArray = JSON.parse(songObject.name[1]);
                      });
                    }
                  });
                }
              });

              let dailyViewsGraph = d3
                .select('#dailyViewsGraph')
                .append('svg')
                .attr('width', graphWidth)
                .attr('height', graphHeight);

              let x = d3
                .scaleLinear()
                .domain([0, viewsArray.length])
                .range([40, graphWidth - 1]);
              let y = d3
                .scaleLinear()
                .domain([0, d3.max(viewsArray)])
                .range([graphHeight - 10, 10]);

              let xAxis = d3
                .axisBottom()
                .scale(x)
                .tickValues([]);
              let yAxis = d3
                .axisLeft()
                .scale(y)
                .ticks(7)
                .tickFormat(d3.format('.3s'));
              dailyViewsGraph
                .append('g')
                .attr('transform', 'translate(0,110)')
                .call(xAxis);
              dailyViewsGraph
                .append('g')
                .attr('transform', 'translate(40,0)')
                .call(yAxis);

              dailyViewsGraph
                .append('path')
                .datum(viewsArray)
                .attr('fill', 'none')
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5)
                .attr(
                  'd',
                  d3
                    .line()
                    .x((d, i) => x(i))
                    .y(d => y(d))
                );
            }
          }
        }
      });

    let text = g
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .style('fill-opacity', function(d) {
        return d.parent === root ? 1 : 0;
      })
      .style('display', function(d) {
        return d.parent === root ? 'inline' : 'none';
      })
      .text(function(d) {
        return d.data.name.split('_').join(' ');
      });

    let node = g.selectAll('circle,text');

    svg.style('background', 'transparent').on('click', function() {
      zoom(root);
    });

    zoomTo([root.x, root.y, root.r * 2]);

    let tooltip = d3
      .select(this.refs.canvas)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '100')
      .style('padding', '10px')
      .style('background', '#F9F9F9')
      .style('border', '2px solid black')
      .style('color', 'black')
      .style('bottom', '0px')
      .style('right', '0px')
      .style('width', '460px')
      .style('visibility', 'hidden');

    d3.selectAll('.node--leaf')
      .style('fill', 'white')
      .on('click', function(d) {
        d3.select('#bubblesPage').style('display', 'none');
        d3.select('#nonBubblesPage').style('visibility', 'visible');
        let oWidth = document.getElementById('graphContainer').offsetWidth;
        getSongEgo(d.data.name, oWidth);
        getIncomingOutgoing(d.data.name, oWidth);
      });

    d3.selectAll('.label')
      .style('pointer-events', 'none')
      .style('text-anchor', 'middle');

    function zoom(d) {
      let focus0 = focus;

      let transition = d3
        .transition()
        .duration(750)
        .tween('zoom', function(d) {
          let i = d3.interpolateZoom(view, [focus0.x, focus0.y, focus0.r * 2]);
          return function(t) {
            zoomTo(i(t));
          };
        });

      transition
        .selectAll('text')
        .filter(function(d) {
          return d.parent === focus || this.style.display === 'inline';
        })
        .style('fill-opacity', function(d) {
          return d.parent === focus ? 1 : 0;
        })
        .on('start', function(d) {
          if (d.parent === focus) this.style.display = 'inline';
        })
        .on('end', function(d) {
          if (d.parent !== focus) this.style.display = 'none';
        });
    }

    function zoomTo(v) {
      let k = diameter / v[2];
      view = v;
      node.attr('transform', function(d) {
        return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')';
      });
      circle.attr('r', function(d) {
        return d.r * k;
      });
    }
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default GenreBubbles;
