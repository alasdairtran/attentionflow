import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import { getVideoInfo } from '../VideoEgo/popout';
import { getIncomingOutgoing } from '../VideoEgo/incomingOutgoing';

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

const hcolor = '#f78ca0';
let vis, viewcount, highlighted, infoWidth;
let xScale, yScale, yAxis, old_max, viewCountPath;
class BarChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
    };
  }

  componentDidMount() {
    const oWidth = document.getElementById('sondInfoCard').offsetWidth;
    this.drawSongExample(oWidth);
  }

  drawSongExample(oWidth) {
    console.log('drawSongExample', this.props);
    const thesong = this.props.videoInfo;

    this.canvasHeight = oWidth;
    this.canvasWidth = oWidth;

    this.infoHeight = this.chartHeight = 130;
    infoWidth = 360;
    this.chartWidth = this.canvasWidth - infoWidth - 20;

    const outer = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight)
      .attr('pointer-events', 'all');
    vis = outer.append('g');

    this.drawSongInfoCard(thesong);
    this.drawSongViewCount(thesong);
    this.drawNetwork_sameArtist(thesong);
    this.drawNetwork_otherSongs(thesong);
  }

  drawSongInfoCard(thesong) {
    vis
      .append('rect')
      .attr('x', 10)
      .attr('width', 10)
      .attr('height', this.infoHeight + 20)
      .style('fill', hcolor);
    vis
      .append('text')
      .attr('x', 40)
      .attr('y', 40)
      .style('font-weight', 'bold')
      .text(thesong.title);
    vis
      .append('text')
      .attr('x', 40)
      .attr('y', 80)
      .text(thesong.artistName);
    var published = [thesong.time_y, thesong.time_m - 1, thesong.time_d].join(
      '/'
    );
    vis
      .append('text')
      .attr('x', 40)
      .attr('y', 100)
      .text(published);
    vis
      .append('text')
      .attr('x', 40)
      .attr('y', 120)
      .text(thesong.genres.join(','));
  }

  drawSongViewCount(thesong) {
    viewcount = vis
      .append('g')
      .attr('transform', 'translate(' + infoWidth + ',20)');
    var startDate = new Date(
      thesong.time_y,
      thesong.time_m - 1,
      thesong.time_d
    );
    console.log('drawSongViewCount', startDate, thesong.dailyView.length);

    var data = [];
    for (var i = 0; i < thesong.dailyView.length; i++) {
      data.push({
        date: new Date(startDate.getTime() + 3600 * 1000 * 24 * i),
        value: thesong.dailyView[i],
      });
    }
    xScale = d3
      .scaleTime()
      .domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      )
      .range([0, this.chartWidth]);
    yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function(d) {
          return +d.value;
        }),
      ])
      .range([this.chartHeight, 0]);
    old_max = yScale.domain()[1];
    viewcount
      .append('g')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
      .call(d3.axisBottom(xScale));
    yAxis = viewcount.append('g').call(d3.axisLeft(yScale));
    viewCountPath = viewcount
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function(d) {
            return xScale(d.date);
          })
          .y(function(d) {
            return yScale(d.value);
          })
      );
    highlighted = viewcount.append('g');
  }

  drawNetwork_sameArtist(thesong) {
    const songsArr = thesong.videos_1;
    const linksArr = thesong.links_1;

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 10;
    const minRadius = 2;
    const minViews = d3.min(viewsList);
    const maxViews = d3.max(viewsList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const nodeScale = 3;
    const inDegreeList = songsArr.map(d => d[3]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolatePuBu)
      .domain([minInDegree, maxInDegree + 5]);

    const nodes = songsArr.map(video => ({
      id: video[0],
      name: video[1],
      radius: radiusScale(video[2]),
      colour: colourScale(video[3]),
      dailyView: video[4],
      time: new Date(video[5], video[6] - 1, video[7]),
      video: video,
    }));

    let links = linksArr.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    const chart_1_height = 200,
      chart_1_topMargin = this.chartHeight + 50;
    const chart_1_backgroud = vis
      .append('rect')
      .attr('width', '100%')
      .attr('height', chart_1_height)
      .style('fill', '#FFF')
      // .style('stroke', '#ddd')
      .attr('transform', 'translate(0,' + chart_1_topMargin + ')');
    const chart_1 = vis.append('g');
    chart_1
      .append('text')
      .attr('x', 10)
      .attr('y', chart_1_height + chart_1_topMargin - 10)
      .text('Videos of ' + thesong.artistName);

    const nodeTitles = songsArr.map(video => video[0]);
    const filteredLinks = [];
    const loops = links.length;
    for (let i = 0; i < loops; i++) {
      let found = false;
      const checking = links.shift();
      if (nodeTitles.includes(checking.target)) {
        for (let j = 0; j < filteredLinks.length; j++) {
          if (
            filteredLinks[j].source === checking.target &&
            filteredLinks[j].target === checking.source
          ) {
            found = true;
            filteredLinks[j].value += checking.value;
            break;
          }
        }
        if (!found) {
          filteredLinks.push(checking);
        }
      }
    }

    links = filteredLinks;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .strength(0.05)
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
      .force('charge', d3.forceManyBody().strength(10))
      .force(
        'center',
        d3.forceCenter(
          this.canvasWidth / 2,
          chart_1_topMargin + chart_1_height / 2
        )
      );

    var newDomain = [
      xScale.invert(-infoWidth),
      xScale.invert(this.canvasWidth - infoWidth),
    ];
    var chart_1_xScale = d3
      .scaleTime()
      .domain(newDomain)
      .range([0, this.canvasWidth]);
    chart_1
      .append('g')
      .attr(
        'transform',
        'translate(0,' + (chart_1_topMargin + chart_1_height) + ')'
      )
      .call(d3.axisBottom(chart_1_xScale));

    const link = chart_1
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => d.value);

    const node = chart_1
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .call(drag(simulation))
      .attr('r', d => nodeScale * d.radius)
      .attr('fill', function(d) {
        if (d.id == thesong.id) return 'red';
        else return d.colour;
      })
      .attr('stroke', '#ccc')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer');

    node.append('title').text(d => d.id);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = 5;
    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        return d.name.split('-')[1];
      })
      .attr('x', function(d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .style('visibility', function(d) {
        if (d.id == thesong.id) return 'visible';
        else return d.radius > radiusLimit ? 'visible' : 'hidden';
      });

    node.on('mouseover', function(d) {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', hcolor);
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', 'visible');
      showOtherSongViewCount(d);
    });

    node.on('mouseleave', function() {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', function(d) {
          if (d.id == thesong.id) return 'red';
          else return d.colour;
        });
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', function(d) {
          if (d.id == thesong.id) return 'visible';
          else return d.radius > radiusLimit ? 'visible' : 'hidden';
        });
      hideOtherSongViewCount();
    });

    simulation.on('tick', () => {
      // ## this code makes nodes NOT bounded in the panel
      node
        .attr('cx', function(d) {
          return infoWidth + xScale(d.time);
        })
        .attr('cy', function(d) {
          return Math.min(
            chart_1_topMargin + chart_1_height - 20,
            Math.max(chart_1_topMargin + 20, d.y)
          );
        })
        .attr('transform', function(d) {
          var new_x = infoWidth + xScale(d.time);
          var new_y = Math.min(
            chart_1_topMargin + chart_1_height - 20,
            Math.max(chart_1_topMargin + 20, d.y)
          );
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('x1', function(d) {
          return infoWidth + xScale(d.source.time);
        })
        .attr('y1', function(d) {
          return Math.min(
            chart_1_topMargin + chart_1_height - 20,
            Math.max(chart_1_topMargin + 20, d.source.y)
          );
        })
        .attr('x2', function(d) {
          return infoWidth + xScale(d.target.time);
        })
        .attr('y2', function(d) {
          return Math.min(
            chart_1_topMargin + chart_1_height - 20,
            Math.max(chart_1_topMargin + 20, d.target.y)
          );
        });
    });
  }

  drawNetwork_otherSongs(thesong) {
    const songsArr = thesong.videos_2;
    const linksArr = thesong.links_2;

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);
    const strokeScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([minStroke, maxStroke]);

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 10;
    const minRadius = 2;
    const minViews = d3.min(viewsList);
    const maxViews = d3.max(viewsList);
    const radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const nodeScale = 3;
    const inDegreeList = songsArr.map(d => d[3]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolatePuBu)
      .domain([minInDegree, maxInDegree + 5]);

    const nodes = songsArr.map(video => ({
      id: video[0],
      name: video[1],
      radius: radiusScale(video[2]),
      colour: colourScale(video[3]),
      dailyView: video[4],
      time: new Date(video[5], video[6] - 1, video[7]),
      video: video,
    }));

    let links = linksArr.map(video => ({
      source: video[0],
      target: video[1],
      value: strokeScale(video[2]),
    }));

    const chart_2_height = 200,
      chart_2_topMargin = this.chartHeight + 80 + chart_2_height;
    const chart_2_backgroud = vis
      .append('rect')
      .attr('width', '100%')
      .attr('height', chart_2_height)
      .style('fill', '#FFF')
      // .style('stroke', '#ddd')
      .attr('transform', 'translate(0,' + chart_2_topMargin + ')');
    const chart_2 = vis.append('g');
    chart_2
      .append('text')
      .attr('x', 10)
      .attr('y', chart_2_height + chart_2_topMargin - 10)
      .text('Ego network of ' + thesong.title);

    const nodeTitles = songsArr.map(video => video[0]);
    const filteredLinks = [];
    const loops = links.length;
    for (let i = 0; i < loops; i++) {
      let found = false;
      const checking = links.shift();
      if (nodeTitles.includes(checking.target)) {
        for (let j = 0; j < filteredLinks.length; j++) {
          if (
            filteredLinks[j].source === checking.target &&
            filteredLinks[j].target === checking.source
          ) {
            found = true;
            filteredLinks[j].value += checking.value;
            break;
          }
        }
        if (!found) {
          filteredLinks.push(checking);
        }
      }
    }

    links = filteredLinks;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .strength(0.05)
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
      .force('charge', d3.forceManyBody().strength(10))
      .force(
        'center',
        d3.forceCenter(
          this.canvasWidth / 2,
          chart_2_topMargin + chart_2_height / 2
        )
      );

    var newDomain = [
      xScale.invert(-infoWidth),
      xScale.invert(this.canvasWidth - infoWidth),
    ];
    var chart_2_xScale = d3
      .scaleTime()
      .domain(newDomain)
      .range([0, this.canvasWidth]);
    chart_2
      .append('g')
      .attr(
        'transform',
        'translate(0,' + (chart_2_topMargin + chart_2_height) + ')'
      )
      .call(d3.axisBottom(chart_2_xScale));

    const link = chart_2
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => d.value);

    const node = chart_2
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .call(drag(simulation))
      .attr('r', d => nodeScale * d.radius)
      .attr('fill', function(d) {
        if (d.id == thesong.id) return 'red';
        else return d.colour;
      })
      .attr('stroke', '#ccc')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer');

    node.append('title').text(d => d.id);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = 5;
    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        return d.name.split('-')[1];
      })
      .attr('x', function(d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .style('visibility', function(d) {
        if (d.id == thesong.id) return 'visible';
        else return d.radius > radiusLimit ? 'visible' : 'hidden';
      });

    node.on('mouseover', function(d) {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', hcolor);
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', 'visible');
      showOtherSongViewCount(d);
    });

    node.on('mouseleave', function() {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', function(d) {
          if (d.id == thesong.id) return 'red';
          else return d.colour;
        });
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', function(d) {
          if (d.id == thesong.id) return 'visible';
          else return d.radius > radiusLimit ? 'visible' : 'hidden';
        });
      hideOtherSongViewCount();
    });

    simulation.on('tick', () => {
      // ## this code makes nodes NOT bounded in the panel
      node
        .attr('cx', function(d) {
          return infoWidth + xScale(d.time);
        })
        .attr('cy', function(d) {
          return Math.min(
            chart_2_topMargin + chart_2_height - 20,
            Math.max(chart_2_topMargin + 20, d.y)
          );
        })
        .attr('transform', function(d) {
          var new_x = infoWidth + xScale(d.time);
          var new_y = Math.min(
            chart_2_topMargin + chart_2_height - 20,
            Math.max(chart_2_topMargin + 20, d.y)
          );
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('x1', function(d) {
          return infoWidth + xScale(d.source.time);
        })
        .attr('y1', function(d) {
          return Math.min(
            chart_2_topMargin + chart_2_height - 20,
            Math.max(chart_2_topMargin + 20, d.source.y)
          );
        })
        .attr('x2', function(d) {
          return infoWidth + xScale(d.target.time);
        })
        .attr('y2', function(d) {
          return Math.min(
            chart_2_topMargin + chart_2_height - 20,
            Math.max(chart_2_topMargin + 20, d.target.y)
          );
        });
    });
  }

  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.nodeMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      console.log(this.state);
      return <Redirect push to={`/overview/video/${this.state.videoId}`} />;
    }
    return <div ref="canvas" />;
  }
}

function hideOtherSongViewCount() {
  yScale.domain([0, old_max]);
  yAxis.call(d3.axisLeft(yScale));
  viewCountPath.attr(
    'd',
    d3
      .line()
      .x(function(d) {
        return xScale(d.date);
      })
      .y(function(d) {
        return yScale(d.value);
      })
  );
  highlighted.attr('display', 'none');
}

function showOtherSongViewCount(othersong) {
  console.log('othersong', othersong);
  var startDate = new Date(othersong.time);

  var data = [];
  for (var i = 0; i < othersong.dailyView.length; i++) {
    data.push({
      date: new Date(startDate.getTime() + 3600 * 1000 * 24 * i),
      value: othersong.dailyView[i],
    });
  }

  let new_max = d3.max(data, function(d) {
    return +d.value;
  });
  if (yScale.domain()[1] < new_max) {
    yScale.domain([0, new_max]);
  }
  yAxis.call(d3.axisLeft(yScale));
  viewCountPath.attr(
    'd',
    d3
      .line()
      .x(function(d) {
        return xScale(d.date);
      })
      .y(function(d) {
        return yScale(d.value);
      })
  );
  // yScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, function(d) { return +d.value; })])
  //   .range([ this.chartHeight, 0 ]);
  highlighted.selectAll('*').remove();
  highlighted
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', hcolor)
    .attr('stroke-width', 1.5)
    .attr(
      'd',
      d3
        .line()
        .x(function(d) {
          return xScale(d.date);
        })
        .y(function(d) {
          return yScale(d.value);
        })
    );
  highlighted.attr('display', 'block');
}

export default BarChart;
