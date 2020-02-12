import React, { Component } from 'react';
import * as d3 from 'd3';
import { getSongEgo } from '../SongEgo/songEgo';
import { getIncomingOutgoing } from '../SongEgo/incomingOutgoing';
import { Redirect } from 'react-router-dom';

class GenreBubbles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
    };
  }

  componentDidMount() {
    const oWidth = document.getElementById('graphContainerBubbles').offsetWidth;
    this.drawGenreBubbles(oWidth);
  }

  drawGenreBubbles(oWidth) {
    const { bubblesInfo } = this.props;
    let root = JSON.parse(JSON.stringify(bubblesInfo));
    const viewsList = [];
    root.children.forEach(genreObject => {
      genreObject.children.forEach(artistObject =>
        viewsList.push(
          ...artistObject.children.map(songObject => songObject.size)
        )
      );
    });
    viewsList.sort((a, b) => b - a);
    const viewsCutoff = viewsList.length < 500 ? 0 : viewsList[500];
    root.children.forEach(genreObject => {
      genreObject.children.forEach(artistObject => {
        artistObject.children = artistObject.children.filter(
          songObject => songObject.size > viewsCutoff
        );
        if (artistObject.children === [])
          genreObject.children.remove(artistObject);
      });
      if (genreObject.children === []) root.children.remove(genreObject);
    });

    const color = d3.scaleSequential(d3.interpolateGnBu).domain([-1, 5]);

    const diameter = oWidth;

    const svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', oWidth)
      .attr('height', oWidth)
      .attr('class', 'bubble');

    const g = svg
      .append('g')
      .attr('transform', `translate(${oWidth / 2},${diameter / 2 + 10})`);

    const pack = d3
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

    let focus = root;
    const nodes = pack(root).descendants();
    let view;

    const circle = g
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
          if (d === root) {
            focus = d;
            zoom(d);
          } else if (d.parent.parent === focus) {
            focus = d.parent;
            zoom(d.parent);
          } else {
            focus = d;
            zoom(d);
          }
        } else if (d !== root) {
          focus = d.parent;
          zoom(d.parent);
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
            // Genre Info
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
                  const songsList = [];
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
            // Artist Info
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
            // Song Info
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

              const graphWidth =
                document.getElementById('bubblesInfo3').offsetWidth - 40;
              const graphHeight = 120;
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

              const dailyViewsGraph = d3
                .select('#dailyViewsGraph')
                .append('svg')
                .attr('width', graphWidth)
                .attr('height', graphHeight);

              const x = d3
                .scaleLinear()
                .domain([0, viewsArray.length])
                .range([40, graphWidth - 1]);
              const y = d3
                .scaleLinear()
                .domain([0, d3.max(viewsArray)])
                .range([graphHeight - 10, 10]);

              const xAxis = d3
                .axisBottom()
                .scale(x)
                .tickValues([]);
              const yAxis = d3
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

    const text = g
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

    const node = g.selectAll('circle,text');

    svg
      .style('background', 'transparent')
      .style('cursor', 'pointer')
      .on('click', function() {
        zoom(root);
      });

    zoomTo([root.x, root.y, root.r * 2]);

    const that = this;

    d3.selectAll('.node--leaf')
      .style('fill', 'white')
      .on('click', function(d) {
        if (focus === d.parent) {
          that.setState({
            clickedOnSong: true,
            title: d.data.name,
          });
        } else if (focus === d.parent.parent) {
          focus = d.parent;
          zoom(d.parent);
        } else if (focus === d.parent.parent.parent) {
          focus = d.parent.parent;
          zoom(d.parent.parent);
        }
      });

    d3.selectAll('.label')
      .style('pointer-events', 'none')
      .style('text-anchor', 'middle');

    function zoom(d) {
      const focus0 = focus;

      const transition = d3
        .transition()
        .duration(750)
        .tween('zoom', function(d) {
          const i = d3.interpolateZoom(view, [
            focus0.x,
            focus0.y,
            focus0.r * 2,
          ]);
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
      const k = diameter / v[2];
      view = v;
      node.attr('transform', function(d) {
        return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`;
      });
      circle.attr('r', function(d) {
        return d.r * k;
      });
    }
  }

  render() {
    if (this.state.clickedOnSong === true) {
      return <Redirect push to={`/overview/song/${this.state.title}`} />;
    }
    return <div ref="canvas" />;
  }
}

export default GenreBubbles;
