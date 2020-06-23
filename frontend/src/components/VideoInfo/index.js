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
let radiusScale, strokeScale;
let nodeScale = 3;
let chart_2_yScale_minimum = 100000;
let egoID, egoTime, simulation, nodes, links;
let graphSorting, chart_2_height, chart_2_topMargin;
let chart_2_yScale_view, chart_2_yScale_artist;
let vis, defs, viewcount, highlighted, oLeft, infoWidth;
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
    this.div = document.getElementById('sondInfoCard');
    oLeft = this.div.getBoundingClientRect().x;
    this.drawSongExample(this.div.offsetWidth);
  }

  drawSongExample(oWidth) {
    console.log('drawSongExample', this.props);
    const thesong = this.props.videoInfo;

    this.canvasHeight = oWidth;
    this.canvasWidth = oWidth;

    this.infoHeight = this.chartHeight = 130;
    infoWidth = 360;
    this.chartWidth = this.canvasWidth - infoWidth - 20;

    graphSorting = document.createElement('SELECT');
    graphSorting.style.position = 'absolute';
    graphSorting.style.top = this.chartHeight + 70 + 'px';
    graphSorting.style.right = '20px';
    var options = ['ForceDirected', 'TotalView', 'Artist'];
    for (var o = 0; o < options.length; o++) {
      var option = document.createElement('option');
      option.value = o;
      option.text = options[o];
      graphSorting.add(option);
    }
    this.div.append(graphSorting);

    const outer = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight)
      .attr('pointer-events', 'all');
    vis = outer.append('g');
    defs = outer.append('defs');

    this.drawSongInfoCard(thesong);
    this.drawSongViewCount(thesong);
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

    console.log('thesong', thesong);
    egoID = thesong.id;
  }

  drawSongViewCount(thesong) {
    viewcount = vis
      .append('g')
      .attr('transform', 'translate(' + infoWidth + ',20)');
    viewcount
      .append('rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'transparent');

    var publishedDate = new Date(
      thesong.time_y,
      thesong.time_m - 1,
      thesong.time_d
    );
    var startDate = new Date(thesong.startDate);
    console.log('startDate', thesong.startDate, startDate);
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
      .domain([
        new Date('2011-01-01'),
        d3.max(data, function(d) {
          return d.date;
        }),
      ])
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

    var time_indicator = viewcount
      .append('line')
      .attr('x1', 100)
      .attr('x2', 100)
      .attr('y1', 0)
      .attr('y2', this.chartHeight)
      .attr('stroke', 'red')
      .attr('display', 'none');
    egoTime = Math.floor(xScale.invert(0));
    viewcount.on('mousemove', function(e) {
      setMousePosition(e);
      var m_pos = Math.max(0, mouse.x - oLeft - infoWidth);
      egoTime = Math.floor(xScale.invert(m_pos));
      time_indicator
        .attr('x1', m_pos)
        .attr('x2', m_pos)
        .attr('display', 'block');
      // console.log("moveEgoNodePosition", m_pos, egoTime)
      calculateViewCount();
      simulation.restart();
    });
    viewcount.on('mouseout', function(e) {
      time_indicator.attr('display', 'none');
    });
    highlighted = viewcount.append('g');
  }

  drawNetwork_otherSongs(thesong) {
    const songsArr = thesong.videos_2;
    const linksArr = thesong.links_2;

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;
    const minWeight = d3.min(strokeList);
    const maxWeight = d3.max(strokeList);

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 10;
    const minRadius = 2;
    const minViews = d3.min(viewsList);
    const maxViews = d3.max(viewsList);

    console.log('strokeScale', [minViews * minWeight, maxViews * maxWeight]);
    strokeScale = d3
      .scaleLinear()
      .domain([minViews * minWeight, maxViews * maxWeight])
      .range([minStroke, maxStroke]);

    radiusScale = d3
      .scaleLinear()
      .domain([minViews, maxViews])
      .range([minRadius, maxRadius]);

    const inDegreeList = songsArr.map(d => d[3]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolatePuBu)
      .domain([minInDegree, maxInDegree + 5]);

    const artistSet = new Set(songsArr.map(video => video[5]));
    nodes = songsArr.map(video => ({
      id: video[0],
      name: video[1],
      radius: radiusScale(video[2]),
      colour: colourScale(video[3]),
      totalView: video[2],
      dailyView: video[4],
      artist: video[5],
      startDate: new Date(video[6]),
      time: new Date(video[7], video[8] - 1, video[9]),
      video: video,
    }));

    links = linksArr.map(video => ({
      id: video[0] + '_' + video[1],
      source: video[0],
      target: video[1],
      weight: video[2],
      value: strokeScale(video[3]),
    }));

    chart_2_height = 500;
    chart_2_topMargin = this.chartHeight + 80;
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
      .attr('x', this.canvasWidth - 20)
      .attr('y', chart_2_height + chart_2_topMargin - 10)
      .attr('text-anchor', 'end')
      .text('Ego network of ' + thesong.title);

    const nodeTitles = songsArr.map(video => video[0]);
    simulation = d3
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

    chart_2_yScale_view = d3
      .scaleLog()
      .domain([
        chart_2_yScale_minimum,
        d3.max(nodes, function(d) {
          return d.totalView;
        }),
      ])
      .range([chart_2_height, 0])
      .nice();
    chart_2_yScale_artist = d3
      .scaleBand()
      .domain(Array.from(artistSet))
      .range([0, chart_2_height]);
    var chart_2_y = chart_2.append('g');

    defs
      .selectAll('marker')
      .data(links)
      .enter()
      .append('marker')
      .attr('id', d => 'arrow_' + d.target.id)
      .attr('markerWidth', '12')
      .attr('markerHeight', '12')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('viewBox', '0 -6 12 12')
      .attr('refX', d => 10 + nodeScale * d.target.radius)
      .attr('refY', d => -d.value / 2)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-6L12,0L0,6')
      .style('fill', '#aaa');

    var link = chart_2
      .append('g')
      .attr('stroke', '#aaa')
      .attr('stroke-opacity', 0.6)
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('id', d => d.id)
      .attr('marker-end', d => 'url(#arrow_' + d.target.id + ')');

    var node = chart_2
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .call(drag(simulation))
      .attr('id', d => d.id)
      .attr('r', function(d) {
        return nodeScale * radiusScale(nodeSize(d));
      })
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

    graphSorting.addEventListener('change', function() {
      if (graphSorting.value == 0) {
        chart_2_y.attr('display', 'none');
      } else if (graphSorting.value == 1) {
        chart_2_y
          .attr('display', 'block')
          .attr('transform', 'translate(50,' + chart_2_topMargin + ')')
          .call(d3.axisLeft(chart_2_yScale_view));
      } else if (graphSorting.value == 2) {
        chart_2_y
          .attr('display', 'block')
          .attr('transform', 'translate(150,' + chart_2_topMargin + ')')
          .call(d3.axisLeft(chart_2_yScale_artist));
      }
      simulation.restart();
    });

    simulation.on('tick', () => {
      // ## this code makes nodes NOT bounded in the panel
      node
        .attr('display', function(d) {
          if (d.time.getTime() <= egoTime) return 'block';
          else return 'none';
        })
        .attr('cx', function(d) {
          if (d.id == egoID) return infoWidth + xScale(egoTime);
          return infoWidth + xScale(d.time);
        })
        .attr('cy', function(d) {
          if (d.id == egoID) return chart_2_topMargin;
          if (graphSorting.value == 0) {
            return Math.min(
              chart_2_topMargin + chart_2_height - 20,
              Math.max(chart_2_topMargin + 20, d.y)
            );
          } else if (graphSorting.value == 1) {
            return (
              chart_2_topMargin +
              chart_2_yScale_view(Math.max(chart_2_yScale_minimum, d.viewSum))
            );
          } else if (graphSorting.value == 2) {
            return (
              chart_2_topMargin +
              chart_2_yScale_artist.bandwidth() / 2 +
              chart_2_yScale_artist(d.artist)
            );
          }
        })
        .attr('transform', function(d) {
          var new_x = infoWidth + xScale(d.time);
          var new_y;
          if (graphSorting.value == 0) {
            new_y = Math.min(
              chart_2_topMargin + chart_2_height - 20,
              Math.max(chart_2_topMargin + 20, d.y)
            );
          } else if (graphSorting.value == 1) {
            new_y =
              chart_2_topMargin +
              chart_2_yScale_view(Math.max(chart_2_yScale_minimum, d.viewSum));
          } else if (graphSorting.value == 2) {
            new_y =
              chart_2_topMargin +
              chart_2_yScale_artist.bandwidth() / 2 +
              chart_2_yScale_artist(d.artist);
          }
          if (d.id == egoID) {
            new_x = infoWidth + xScale(egoTime);
            new_y = chart_2_topMargin;
          }
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('d', linkArc)
        .attr('stroke-width', d => d.value)
        .attr('display', function(d) {
          if (
            d.source.time.getTime() <= egoTime &&
            d.target.time.getTime() <= egoTime
          )
            return 'block';
          else return 'none';
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

function calculateViewCount() {
  for (var i = 0; i < nodes.length; i++) {
    var n = document.getElementById(nodes[i].id);
    var viewSum = nodeSize(nodes[i]);
    var radius = radiusScale(viewSum);
    nodes[i]['viewSum'] = viewSum;
    nodes[i]['radius'] = radius;
    n.style.r = nodeScale * radius;
  }
  for (var i = 0; i < links.length; i++) {
    links[i].value = strokeScale(links[i].source.viewSum * links[i].weight);
  }
}

function nodeSize(d) {
  if (egoTime == undefined) return d.totalView;

  // console.log("nodesize", egoTime, d);
  var startDate = new Date(d.startDate);
  var viewSum = [];
  for (var i = 0; i < d.dailyView.length; i++) {
    var date = new Date(startDate.getTime() + 3600 * 1000 * 24 * i);
    if (date.getTime() <= egoTime) viewSum.push(d.dailyView[i]);
    else break;
  }
  if (viewSum.length == 0) return 0;
  return viewSum.reduce(arraysum);
}

function arraysum(total, num) {
  return total + num;
}

function linkArc(d) {
  var px1 = infoWidth + xScale(d.source.time),
    px2 = infoWidth + xScale(d.target.time);
  var py1, py2;
  if (graphSorting.value == 0) {
    py1 = Math.min(
      chart_2_topMargin + chart_2_height - 20,
      Math.max(chart_2_topMargin + 20, d.source.y)
    );
    py2 = Math.min(
      chart_2_topMargin + chart_2_height - 20,
      Math.max(chart_2_topMargin + 20, d.target.y)
    );
  } else if (graphSorting.value == 1) {
    var ypos1 = chart_2_yScale_view(
      Math.max(chart_2_yScale_minimum, d.source.viewSum)
    );
    var ypos2 = chart_2_yScale_view(
      Math.max(chart_2_yScale_minimum, d.target.viewSum)
    );
    py1 = chart_2_topMargin + ypos1;
    py2 = chart_2_topMargin + ypos2;
  } else if (graphSorting.value == 2) {
    py1 =
      chart_2_topMargin +
      chart_2_yScale_artist.bandwidth() / 2 +
      chart_2_yScale_artist(d.source.artist);
    py2 =
      chart_2_topMargin +
      chart_2_yScale_artist.bandwidth() / 2 +
      chart_2_yScale_artist(d.target.artist);
  }

  if (d.source.id == egoID) {
    px1 = infoWidth + xScale(egoTime);
    py1 = chart_2_topMargin;
  }
  if (d.target.id == egoID) {
    px2 = infoWidth + xScale(egoTime);
    py2 = chart_2_topMargin;
  }

  var dx = px2 - px1,
    dy = py2 - py1,
    dr = Math.sqrt(dx * dx + dy * dy);
  if (d.label == '') dr = 10000;
  return (
    'M' + px1 + ',' + py1 + 'A' + dr + ',' + dr + ' 0 0,1 ' + px2 + ',' + py2
  );
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
  // console.log('othersong', othersong);
  var startDate = new Date(othersong.startDate);

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

var mouse = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
};
function setMousePosition(e) {
  var ev = e || window.event; //Moz || IE
  if (ev.pageX) {
    //Moz
    mouse.x = ev.pageX + window.pageXOffset;
    mouse.y = ev.pageY + window.pageYOffset;
  } else if (ev.clientX) {
    //IE
    mouse.x = ev.clientX + document.body.scrollLeft;
    mouse.y = ev.clientY + document.body.scrollTop;
  }
  // console.log(mouse)
}
