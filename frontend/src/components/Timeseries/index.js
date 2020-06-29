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

Date.prototype.toShortFormat = function() {
  let monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let day = this.getDate();
  let monthIndex = this.getMonth();
  let monthName = monthNames[monthIndex];
  let year = this.getFullYear();
  return monthName + ' ' + day + ', ' + year;
};

function numFormatter(num) {
  var newNum = '';
  if (Math.abs(num) > 999999999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000000000).toFixed(1) + 'B';
  else if (Math.abs(num) > 999999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000000).toFixed(1) + 'M';
  else if (Math.abs(num) > 999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'K';
  else newNum = Math.sign(num) * Math.abs(num);
  return newNum == 0 ? '' : newNum;
}

const hcolor = '#f78ca0';
let radiusScale, strokeScale;
let nodeScale = 3;
let padding_x = 20;
let chart_yScale_minimum = 100000;
let chart_xScale_minimum = new Date('2009-11-01');
let egoID, egoType, egoTime, simulation, nodes, links;
let graphSorting, chart_height, chart_topMargin;
let chart_yScale_view, chart_yScale_artist, startPos, topvideo_data;
let vis, defs, viewcount, highlighted, oLeft;
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
    this.drawTimePanel(this.div.offsetWidth);
  }

  drawTimePanel(oWidth) {
    // console.log('drawTimePanel', this.props);
    const theEgo = this.props.egoInfo;
    console.log('theEgo', theEgo, this.props.egoType);
    egoType = this.props.egoType;
    egoID = theEgo.id;
    this.canvasWidth = oWidth;
    this.infoHeight = 160;
    this.chartHeight = 120;
    this.chartWidth = this.canvasWidth - padding_x * 2;

    this.canvasHeight = this.infoHeight + this.chartHeight + 560;

    graphSorting = document.createElement('SELECT');
    graphSorting.style.position = 'absolute';
    graphSorting.style.top = this.infoHeight + this.chartHeight + 50 + 'px';
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

    this.drawEgoInfoCard(theEgo);
    this.drawEgoMoreInfo(theEgo);
    this.drawEgoViewCount(theEgo);
    this.drawEgoNetwork(theEgo);
  }

  drawEgoInfoCard(theEgo) {
    var infocard = document.createElement('div');
    infocard.style.position = 'absolute';
    infocard.style.width = 'auto';
    infocard.style.height = this.infoHeight + 10 + 'px';
    infocard.style.margin = '0 20px 10px 20px';
    infocard.style.padding = '20px';
    infocard.style.borderLeft = '10px solid ' + hcolor;

    var published = new Date(theEgo.publishedAt);
    var infocardtext = document.createElement('div');

    var egoInfoText = '<h5><b>' + theEgo.title + '</b></h5><br/>';
    egoInfoText += 'Artist: ' + theEgo.artistName + '<br/>';
    egoInfoText += 'Published: ' + published.toShortFormat() + '<br/>';
    egoInfoText += 'Genres: ' + theEgo.genres.join(',');

    infocardtext.innerHTML = egoInfoText;
    infocard.append(infocardtext);
    this.div.append(infocard);
  }

  drawEgoViewCount(theEgo) {
    viewcount = vis
      .append('g')
      .attr(
        'transform',
        'translate(' + padding_x + ',' + (this.infoHeight + 20) + ')'
      );
    viewcount
      .append('rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'transparent');

    var publishedDate = new Date(theEgo.publishedAt);
    var startDate = new Date(theEgo.startDate);
    console.log('startDate', theEgo.startDate, startDate);
    console.log('drawEgoViewCount', startDate, theEgo.dailyView.length);

    var data = [];
    for (var i = 0; i < theEgo.dailyView.length; i++) {
      data.push({
        date: new Date(startDate.getTime() + 3600 * 1000 * 24 * i),
        value: theEgo.dailyView[i],
      });
    }
    xScale = d3
      .scaleTime()
      .domain([
        Math.min(
          chart_xScale_minimum,
          d3.min(data, function(d) {
            return d.date;
          })
        ),
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
    startPos = xScale(
      d3.min(data, function(d) {
        return d.date;
      })
    );
    viewcount
      .append('g')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
      .call(d3.axisBottom(xScale));
    yAxis = viewcount
      .append('g')
      .attr('transform', 'translate(' + startPos + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(numFormatter));
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
      .attr('stroke', hcolor)
      .attr('display', 'none');
    egoTime = Math.floor(xScale.invert(0));
    viewcount.on('mousemove', function(e) {
      setMousePosition(e);
      var m_pos = Math.max(0, mouse.x - oLeft);
      egoTime = Math.floor(xScale.invert(m_pos));
      time_indicator
        .attr('x1', m_pos)
        .attr('x2', m_pos)
        .attr('display', 'block');
      calculateViewCount();
      simulation.restart();
    });
    viewcount.on('mouseout', function(e) {
      time_indicator.attr('display', 'none');
    });
    highlighted = viewcount.append('g');
  }

  drawEgoMoreInfo(theEgo) {
    var embvideo_id;
    var embvideo = document.createElement('iframe');
    if (egoType == 'V') {
      embvideo_id = theEgo.id;
    } else if (egoType == 'A') {
      embvideo_id = theEgo.topvideos[0][0][0];
    }
    embvideo.width = 300;
    embvideo.height = this.infoHeight;
    embvideo.style.position = 'absolute';
    embvideo.style.right = '0px';
    embvideo.style.margin = '10px 20px';
    embvideo.style.border = 'none';
    embvideo.src = 'https://www.youtube.com/embed/' + embvideo_id;
    this.div.append(embvideo);

    if (egoType == 'A') {
      topvideo_data = {};
      var topvideos = document.createElement('div');
      topvideos.width = 300;
      topvideos.style.position = 'absolute';
      topvideos.style.right = '320px';
      topvideos.style.padding = '15px 20px';
      for (var i = 0, j = 0; i < theEgo.topvideos[0].length, j < 7; i++, j++) {
        var videodiv = document.createElement('div');
        var video = theEgo.topvideos[0][i];
        var vtitle = video[1].split('-')[1];
        var vtitle_str =
          vtitle.length > 20 ? vtitle.slice(0, 20) + '...' : vtitle;
        topvideo_data[video[0]] = {
          title: vtitle,
          startDate: video[3],
          dailyView: video[5],
        };
        videodiv.id = video[0];
        videodiv.innerHTML += '<b>' + vtitle_str + '</a> ';
        videodiv.innerHTML +=
          numFormatter(video[4]) +
          ' views • ' +
          new Date(video[2]).toShortFormat() +
          '<br/>';
        videodiv.addEventListener('mouseover', function(e) {
          showOtherSongViewCount(topvideo_data[this.id]);
        });
        videodiv.addEventListener('mouseout', function(e) {
          hideOtherSongViewCount();
        });
        topvideos.append(videodiv);
      }
      this.div.append(topvideos);
    }
  }

  drawEgoNetwork(theEgo) {
    const songsArr = theEgo.nodes;
    const linksArr = theEgo.links;

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 0.5;
    const maxStroke = 5;

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 10;
    const minRadius = 2;

    strokeScale = d3
      .scaleLinear()
      .domain(d3.extent(strokeList))
      .range([minStroke, maxStroke]);

    radiusScale = d3
      .scaleLinear()
      .domain(d3.extent(viewsList))
      .range([minRadius, maxRadius]);

    const inDegreeList = songsArr.map(d => d[3]);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolateRdPu)
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
      time: new Date(video[7]),
    }));

    links = linksArr.map(video => ({
      id: video[0] + '_' + video[1],
      source: video[0],
      target: video[1],
      flux: video[2],
      startDate: new Date(video[3]),
      dailyFlux: video[4],
    }));

    // console.log(nodes);

    chart_height = 500;
    chart_topMargin = this.infoHeight + this.chartHeight + 45;
    const chart_backgroud = vis
      .append('rect')
      .attr('width', this.canvasWidth - 40)
      .attr('height', chart_height)
      .style('fill', '#f0f0f0')
      .attr('transform', 'translate(20,' + chart_topMargin + ')');
    const chart = vis.append('g');

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
        d3.forceCenter(this.canvasWidth / 2, chart_topMargin + chart_height / 2)
      );

    var newDomain = [xScale.invert(0), xScale.invert(this.canvasWidth)];
    chart
      .append('g')
      .attr('transform', 'translate(' + padding_x + ',' + chart_topMargin + ')')
      .call(d3.axisTop(xScale).tickFormat(''));

    chart_yScale_view = d3
      .scaleLog()
      .domain([
        chart_yScale_minimum,
        2 *
          d3.max(nodes, function(d) {
            return d.totalView;
          }),
      ])
      .range([chart_height, 0])
      .nice();
    chart_yScale_artist = d3
      .scaleBand()
      .domain([''].concat(Array.from(artistSet)))
      .range([0, chart_height]);
    var chart_y = chart.append('g');

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

    var link = chart
      .append('g')
      .attr('stroke', '#aaa')
      .attr('stroke-opacity', 0.5)
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('id', d => d.id)
      .attr('marker-end', d => 'url(#arrow_' + d.target.id + ')');

    var node = chart
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
        if (d.id == theEgo.id) return 'steelblue';
        else return d.colour;
      })
      .attr('stroke', '#aaa')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer');

    node.append('title').text(d => d.id);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = 5;
    node
      .append('text')
      .call(drag(simulation))
      .text(function(d) {
        if (egoType == 'V') return d.name.split('-')[1];
        if (egoType == 'A') return d.name;
      })
      .attr('x', function(d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .style('visibility', function(d) {
        if (d.id == theEgo.id) return 'visible';
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
          if (d.id == theEgo.id) return 'steelblue';
          else return d.colour;
        });
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', function(d) {
          if (d.id == theEgo.id) return 'visible';
          else return d.radius > radiusLimit ? 'visible' : 'hidden';
        });
      hideOtherSongViewCount();
    });

    graphSorting.addEventListener('change', function() {
      if (graphSorting.value == 0) {
        chart_y.attr('display', 'none');
      } else if (graphSorting.value == 1) {
        chart_y
          .attr('display', 'block')
          .attr(
            'transform',
            'translate(' + (startPos + padding_x) + ',' + chart_topMargin + ')'
          )
          .call(
            d3
              .axisLeft(chart_yScale_view)
              .ticks(5)
              .tickFormat(numFormatter)
          );
      } else if (graphSorting.value == 2) {
        chart_y
          .attr('display', 'block')
          .attr(
            'transform',
            'translate(' + (startPos + padding_x) + ',' + chart_topMargin + ')'
          )
          .call(d3.axisLeft(chart_yScale_artist));
      }
      simulation.restart();
    });

    simulation.on('tick', () => {
      // ## this code makes nodes NOT bounded in the panel
      node
        .attr('display', function(d) {
          if (d.startDate.getTime() <= egoTime) return 'block';
          else return 'none';
        })
        .attr('cx', function(d) {
          if (d.id == egoID) return padding_x + xScale(egoTime);
          return padding_x + xScale(d.startDate);
        })
        .attr('cy', function(d) {
          // if (d.id == egoID) return chart_topMargin;
          if (graphSorting.value == 0) {
            return Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (graphSorting.value == 1) {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum))
            );
          } else if (graphSorting.value == 2) {
            return (
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist)
            );
          }
        })
        .attr('transform', function(d) {
          var new_x = padding_x + xScale(d.startDate);
          var new_y;
          if (graphSorting.value == 0) {
            new_y = Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (graphSorting.value == 1) {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum));
          } else if (graphSorting.value == 2) {
            new_y =
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist);
          }
          if (d.id == egoID) {
            new_x = padding_x + xScale(egoTime);
            // new_y = chart_topMargin;
          }
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('d', linkArc)
        .attr('stroke-width', d => d.value)
        .attr('display', function(d) {
          if (
            d.source.startDate.getTime() <= egoTime &&
            d.target.startDate.getTime() <= egoTime
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
    var fluxSum = linkWeight(links[i]);
    links[i].value = strokeScale(fluxSum);
  }
}

function nodeSize(d) {
  if (egoTime == undefined) return d.totalView;
  // console.log("nodesize", egoTime, d);
  var viewSum = 0;
  for (var i = 0; i < d.dailyView.length; i++) {
    var date = new Date(d.startDate.getTime() + 3600 * 1000 * 24 * i);
    if (date.getTime() <= egoTime) viewSum += d.dailyView[i];
    else break;
  }
  return viewSum;
}

function linkWeight(d) {
  if (egoTime == undefined) return d.flux;

  var fluxSum = 0;
  for (var i = 0; i < d.dailyFlux.length; i++) {
    var date = new Date(d.startDate.getTime() + 3600 * 1000 * 24 * i);
    if (date.getTime() <= egoTime) fluxSum += d.dailyFlux[i];
    else break;
  }
  return fluxSum;
}

function arraysum(total, num) {
  return total + num;
}

function linkArc(d) {
  var px1 = padding_x + xScale(d.source.startDate);
  var px2 = padding_x + xScale(d.target.startDate);
  var py1, py2;
  if (graphSorting.value == 0) {
    py1 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.source.y)
    );
    py2 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.target.y)
    );
  } else if (graphSorting.value == 1) {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.viewSum)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.viewSum)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (graphSorting.value == 2) {
    py1 =
      chart_topMargin +
      chart_yScale_artist.bandwidth() / 2 +
      chart_yScale_artist(d.source.artist);
    py2 =
      chart_topMargin +
      chart_yScale_artist.bandwidth() / 2 +
      chart_yScale_artist(d.target.artist);
  }

  if (d.source.id == egoID) {
    px1 = padding_x + xScale(egoTime);
    // py1 = chart_topMargin;
  }
  if (d.target.id == egoID) {
    px2 = padding_x + xScale(egoTime);
    // py2 = chart_topMargin;
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
  yAxis.call(d3.axisLeft(yScale).tickFormat(numFormatter));
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
  yAxis.call(d3.axisLeft(yScale).tickFormat(numFormatter));
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
  mouse.x -= padding_x;
  // console.log(mouse)
}
