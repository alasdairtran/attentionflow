import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.css';
import './timeseries.css';

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
  // return monthName + ' ' + day + ', ' + year;
  return [year, monthIndex + 1, day].join('/');
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

function stringfy(id) {
  return '_' + id;
}

const hcolor = '#f78ca0';
let radiusScale, strokeScale;
let padding_x = 15;
let rightMargin = 40;
let chart_yScale_minimum = 100000;
let chart_xScale_minimum = new Date('2009-11-01');
let egoID, egoType, egoTime, simulation, nodes, links;
let graphSorting, infSlider;
let graphSortingOpts = [
  'Force Directed',
  'Total View',
  'Contributed',
  'Received',
  'Artist Name',
];
let chart_height, chart_topMargin;
let chart_yScale_view, chart_yScale_artist, startPos, topVideos;
let vis, visinfo, defs, viewcount, highlighted;
let xScale, yScale, yAxis, oldMaxView, viewCountPath;

class AttentionFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      clickedVideoID: null,
    };
  }

  componentDidMount() {
    this.divTitle = document.getElementById('egoTitle');
    this.divInfo = document.getElementById('egoInfo');
    this.divTimeline = document.getElementById('egoTimeline');
    this.drawTimePanel();
  }

  drawTimePanel() {
    // console.log('drawTimePanel', this.props);
    const theEgo = this.props.egoInfo;
    console.log('theEgo', theEgo, this.props.egoType);

    egoType = this.props.egoType;
    egoID = stringfy(theEgo.id);

    this.canvasWidth = this.divTimeline.offsetWidth - padding_x * 2;
    this.chartHeight = 120;
    this.chartWidth = this.canvasWidth - padding_x * 2 - rightMargin;
    this.canvasHeight = this.chartHeight + 560;

    d3.select(this.refs.canvas)
      .selectAll('svg')
      .remove();
    const outer = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight)
      .attr('pointer-events', 'all');
    vis = outer.append('g');
    visinfo = outer.append('g');
    defs = outer.append('defs');

    this.drawEgoInfoCard(theEgo);
    this.drawEgoViewCount(theEgo);
    this.drawTimeSelector(theEgo);
    this.drawEgoNetwork(theEgo);

    if (egoType == 'V') infSlider.noUiSlider.set(0);
    else if (egoType == 'A') infSlider.noUiSlider.set(20);
  }

  drawTimeSelector(theEgo) {
    var old = document.getElementById('timeRange');
    if (old) old.remove();

    var range = document.createElement('div');
    range.id = 'timeRange';
    range.style.width = this.canvasWidth - padding_x * 2 - rightMargin + 'px';
    range.style.top = this.chartHeight + 30 + 'px';
    range.style.left = padding_x * 2 + 'px';
    this.divTimeline.append(range);

    var egoStartDate = theEgo.startDate;
    var minTime = xScale.domain()[0].getTime();
    var maxTime = xScale.domain()[1].getTime();
    noUiSlider.create(range, {
      range: {
        min: minTime,
        max: maxTime,
      },
      connect: true,
      step: aDay(), // A day
      start: [egoStartDate, maxTime],
    });
  }

  drawEgoInfoCard(theEgo) {
    // Set ego title
    this.divTitle.innerHTML = '<h5><b>' + theEgo.title + '</b></h5>';

    // update ego information
    this.divInfo.innerHTML = '';
    var infocard = document.createElement('div');
    infocard.setAttribute('id', 'egoInfoCard');

    var published = new Date(theEgo.publishedAt);
    var infocardtext = document.createElement('div');

    var egoInfoText = '';
    if (egoType == 'A') {
      egoInfoText += 'First song published: ' + published.toShortFormat();
      egoInfoText += '</br>Total views: ' + numFormatter(theEgo.totalView);
      infocardtext.innerHTML = egoInfoText;
      infocard.append(infocardtext);
      this.divInfo.append(infocard);
      this.addTopVideos(this.divInfo, theEgo);
    } else if (egoType == 'V') {
      this.addVideoThumbnail(this.divInfo, theEgo);
      egoInfoText += 'Published: ' + published.toShortFormat();
      egoInfoText += '</br>Genres: ' + theEgo.genres.join(',');
      infocardtext.innerHTML = egoInfoText;
      infocard.append(infocardtext);
      this.divInfo.append(infocard);
    }

    var controlPanel = document.createElement('div');
    controlPanel.id = 'controlPanel';

    var infSliderLabel = document.createElement('div');
    infSliderLabel.innerHTML = '<b>Influence Filter (%)</b>';
    infSlider = document.createElement('div');
    infSlider.id = 'infSlider';
    noUiSlider.create(infSlider, {
      range: {
        min: 0,
        max: 50,
      },
      step: 1,
      start: 10,
      pips: { mode: 'count', values: 6 },
    });

    var pips = infSlider.querySelectorAll('.noUi-value');
    for (var i = 0; i < pips.length; i++) {
      pips[i].style.cursor = 'pointer';
      pips[i].addEventListener('click', function() {
        var value = Number(this.getAttribute('data-value'));
        infSlider.noUiSlider.set(value);
      });
    }
    infSlider.noUiSlider.on('set.one', function() {
      filterNodes();
      simulation.restart();
    });

    var graphSortingLabel = document.createElement('div');
    graphSortingLabel.innerHTML = '<b>Y-position</b>';

    graphSorting = document.createElement('SELECT');
    graphSorting.id = 'graphSorting';
    for (var o = 0; o < graphSortingOpts.length; o++) {
      var option = document.createElement('option');
      option.value = o;
      option.text = graphSortingOpts[o];
      graphSorting.add(option);
    }

    controlPanel.append(infSliderLabel);
    controlPanel.append(infSlider);
    controlPanel.append(graphSortingLabel);
    controlPanel.append(graphSorting);

    this.divInfo.append(controlPanel);
  }

  addVideoThumbnail(div, theEgo) {
    var embvideo_id;
    var embvideo = document.createElement('iframe');
    if (egoType == 'V') {
      embvideo_id = theEgo.id;
    } else if (egoType == 'A') {
      embvideo_id = stringfy(theEgo.topvideos[0][0][0]);
    }
    var videoWidth = div.offsetWidth - 60;
    embvideo.width = videoWidth;
    embvideo.height = 0.6 * videoWidth;
    embvideo.style.border = 'none';
    embvideo.style.margin = '30px 0 0 30px';
    embvideo.src = 'https://www.youtube.com/embed/' + embvideo_id;
    embvideo.src +=
      '?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    div.append(embvideo);
  }

  addTopVideos(div, theEgo) {
    topVideos = {};
    var topvideos = document.createElement('div');
    topvideos.innerHTML = '<b>Top Songs</b><br/>';
    topvideos.style.padding = '0 0 20px 30px';
    for (var i = 0, j = 0; i < theEgo.topvideos[0].length, j < 5; i++, j++) {
      var videodiv = document.createElement('div');
      var video = theEgo.topvideos[0][i];
      var vtitle = video[1].split('-')[1];
      var vtitle_str =
        vtitle.length > 20 ? vtitle.slice(0, 30) + '...' : vtitle;
      topVideos[video[0]] = {
        title: vtitle,
        startDate: video[3],
        dailyView: video[5],
      };
      videodiv.id = stringfy(video[0]);
      videodiv.innerHTML += '<b>' + vtitle_str + '</b><br/>';
      videodiv.innerHTML +=
        numFormatter(video[4]) +
        ' views • ' +
        new Date(video[2]).toShortFormat() +
        '<br/>';
      videodiv.addEventListener('mouseover', function(e) {
        showOtherSongViewCount(topVideos[this.id]);
      });
      videodiv.addEventListener('mouseout', function(e) {
        hideOtherSongViewCount(topVideos[this.id]);
      });
      topvideos.append(videodiv);
    }
    div.append(topvideos);
  }

  drawEgoViewCount(theEgo) {
    viewcount = vis
      .append('g')
      .attr('transform', 'translate(' + padding_x + ',' + 20 + ')');
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
        date: new Date(startDate.getTime() + aDay() * i),
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
    oldMaxView = yScale.domain()[1];
    startPos = xScale(
      d3.min(data, function(d) {
        return d.date;
      })
    );
    viewcount
      .append('g')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
      .call(d3.axisBottom(xScale).tickFormat(''));
    yAxis = viewcount
      .append('g')
      .attr('transform', 'translate(' + startPos + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(numFormatter));
    viewCountPath = viewcount
      .append('path')
      .datum(data)
      .attr('class', 'viewcount')
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
      .attr('id', 'egoIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');
    var other_indicator = viewcount
      .append('line')
      .attr('id', 'otherIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');

    // add highlighted layer under timecover
    highlighted = viewcount.append('g');
    var time_cover = viewcount
      .append('rect')
      .attr('class', 'timeCover')
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', this.chartHeight + 525);

    egoTime = Math.floor(xScale.invert(0));
    var egoInfoBox = visinfo.append('text').style('font-size', '12px');
    visinfo.append('rect').attr('id', 'otherInfobox');
    visinfo
      .append('text')
      .attr('id', 'otherInfobox')
      .attr('display', 'none');

    viewcount.on('mousemove', function(e) {
      setMousePosition(e);
      var m_pos = getTimePositionX();
      egoTime = Math.floor(xScale.invert(m_pos));
      time_indicator
        .attr('x1', m_pos)
        .attr('x2', m_pos)
        .attr('display', 'block');
      var chartWidth = document
        .getElementById('timeRange')
        .getBoundingClientRect().width;
      time_cover.attr('x', m_pos + 1).attr('width', chartWidth - m_pos);

      var egoCircle = d3.select('circle#' + egoID);
      var pos_y =
        30 + parseFloat(d3.select(egoCircle.node().parentNode).attr('cy'));
      var viewSum = egoCircle.data()[0].viewSum;
      egoInfoBox
        .attr('y', pos_y)
        .html(
          '<tspan x="' +
            (padding_x + m_pos + 15) +
            '" dy="0">' +
            numFormatter(viewSum) +
            ' views</tspan>' +
            '<tspan x="' +
            (padding_x + m_pos + 15) +
            '" dy="15">' +
            new Date(egoTime).toShortFormat() +
            '</tspan>'
        );

      calculateViewCount(egoTime);
      simulation.restart();
    });
  }

  drawEgoNetwork(theEgo) {
    const songsArr = theEgo.nodes;
    const linksArr = theEgo.links;

    const strokeList = linksArr.map(link => link[2]);
    const minStroke = 1;
    const maxStroke = 20;

    const viewsList = songsArr.map(d => d[2]);
    const maxRadius = 50;
    const minRadius = 10;

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
      id: stringfy(video[0]),
      name: video[1],
      radius: radiusScale(video[2]),
      colour: colourScale(video[3]),
      totalView: video[2],
      dailyView: video[4],
      artist: video[5],
      startDate: new Date(video[6]),
      time: new Date(video[7]),
      startInfluence: new Date(video[6] + aDay() * video[4].length),
    }));

    links = linksArr.map(video => ({
      id: stringfy(video[0] + '_' + video[1]),
      source: stringfy(video[0]),
      target: stringfy(video[1]),
      flux: video[2],
      startDate: new Date(video[3]),
      dailyFlux: video[4],
    }));

    chart_height = 500;
    chart_topMargin = this.chartHeight + 70;
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
            return d.radius + 10;
          })
          .iterations(100)
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
      .call(d3.axisTop(xScale));

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
      .attr('refX', d => 10 + d.target.radius)
      .attr('refY', d => -d.value / 2)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-6L12,0L0,6')
      .style('fill', '#aaa');

    var link = chart
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'edge')
      .attr('id', d => d.id);
    // .attr('marker-end', d => 'url(#arrow_' + d.target.id + ')');

    var node = chart
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    // Add gradient circles
    var grads = chart
      .append('defs')
      .selectAll('radialGradient')
      .data(nodes)
      .enter()
      .append('radialGradient')
      .attr('gradientUnits', 'objectBoundingBox')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '100%')
      .attr('id', d => 'grad' + d.id);

    const gradColour = (d, offset) => {
      if (offset === 0) {
        return 'white';
      }
      const nPoints = d.dailyView.length;
      const end = Math.round((nPoints * offset) / 100);
      const nViews = d.dailyView.slice(0, end).reduce((a, b) => a + b, 0);
      const totalViews = d.totalView;
      const viewColourScale = d3
        .scaleSequential(
          d.id === egoID ? d3.interpolatePuBu : d3.interpolateBuPu
        )
        .domain([0, totalViews]);
      return viewColourScale(nViews);
    };

    const offsets = [0, 20, 40, 60, 80, 100];

    offsets.forEach(offset => {
      grads
        .append('stop')
        .attr('offset', `${offset}%`)
        .style('stop-color', d => gradColour(d, offset));
    });

    node
      .append('circle')
      .call(drag(simulation))
      .attr('id', d => d.id)
      .attr('class', 'node')
      .attr('r', function(d) {
        return radiusScale(nodeSize(d));
      })
      .attr('fill', d => `url(#grad${d.id})`);

    nodes.sort((a, b) => a.radius - b.radius);
    const radiusLimit = minRadius * 2;
    node
      .append('text')
      .call(drag(simulation))
      .attr('class', 'node')
      .text(function(d) {
        if (egoType == 'V') return d.name.split('-')[1];
        if (egoType == 'A') return d.name;
      })
      .attr('x', function(d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('visibility', function(d) {
        if (d.id == egoID) return 'visible';
        else return d.radius > radiusLimit ? 'visible' : 'hidden';
      });

    node.on('click', d => {
      console.log(d);
      this.setState({
        clickedOnSong: true,
        clickedVideoID: d.id.substr(1),
      });
    });

    node.on('mouseover', function(d) {
      if (d.id == egoID) return;
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

    node.on('mouseleave', function(d) {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', d => `url(#grad${d.id})`);
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', function(d) {
          if (d.id == egoID) return 'visible';
          else return d.radius > radiusLimit ? 'visible' : 'hidden';
        });
      hideOtherSongViewCount(d);
    });

    graphSorting.addEventListener('change', function() {
      var sortingOpt = graphSortingOpts[graphSorting.value];
      if (sortingOpt == 'Force Directed') {
        chart_y.attr('display', 'none');
      } else if (sortingOpt == 'Total View') {
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
      } else if (sortingOpt == 'Artist Name') {
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
          if (d.id == egoID) return 'block';
          if (d.startInfluence.getTime() <= egoTime) return 'block';
          else return 'none';
        })
        .attr('cx', function(d) {
          if (d.id == egoID) return padding_x + xScale(egoTime);
          if (d.startInfluence.getTime() <= egoTime) {
            return padding_x + xScale(d.startInfluence);
          }
        })
        .attr('cy', function(d) {
          var sortingOpt = graphSortingOpts[graphSorting.value];
          if (sortingOpt == 'Force Directed') {
            return Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (sortingOpt == 'Total View') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum))
            );
          } else if (sortingOpt == 'Artist Name') {
            return (
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist)
            );
          }
        })
        .attr('transform', function(d) {
          var new_x = padding_x + xScale(d.startInfluence);
          var new_y;
          var sortingOpt = graphSortingOpts[graphSorting.value];
          if (sortingOpt == 'Force Directed') {
            new_y = Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (sortingOpt == 'Total View') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum));
          } else if (sortingOpt == 'Artist Name') {
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
            (d.source.startInfluence.getTime() <= egoTime &&
              d.target.startInfluence.getTime() <= egoTime) ||
            (d.source.startInfluence.getTime() <= egoTime &&
              d.target.id == egoID) ||
            (d.target.startInfluence.getTime() <= egoTime &&
              d.source.id == egoID)
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
      return (
        <Redirect push to={`/overview/video/${this.state.clickedVideoID}`} />
      );
    }
    return <div ref="canvas" />;
  }
}

function getTimePositionX() {
  var mouseX = Math.max(0, mouse.x - getWindowLeftMargin());
  var trange = getTimeSelection();
  var xMin = xScale(trange[0]);
  var xMax = xScale(trange[1]);
  return Math.max(xMin, Math.min(mouseX, xMax));
}

function getTimeSelection() {
  var tSlider = document.getElementById('timeRange');
  var range = tSlider.noUiSlider.get('range');
  return [new Date(parseInt(range[0])), new Date(parseInt(range[1]) - aDay())];
}

function getWindowLeftMargin() {
  var div = document.getElementById('egoTimeline');
  return div.getBoundingClientRect().x;
}

function calculateViewCount(curTime) {
  var egoViewSum;
  for (var i = 0; i < nodes.length; i++) {
    var n = document.getElementById(nodes[i].id);
    var viewSum = nodeSize(nodes[i], curTime);
    var radius = radiusScale(viewSum);
    nodes[i]['viewSum'] = viewSum;
    nodes[i]['radius'] = radius;
    n.style.r = radius;
    if (nodes[i].id == egoID) egoViewSum = viewSum;
  }
  for (var i = 0; i < links.length; i++) {
    var fluxSum = linkWeight(links[i], egoViewSum, curTime);
    links[i]['fluxSum'] = fluxSum;
    links[i].value = strokeScale(fluxSum);
  }
  return egoViewSum;
}

function aDay() {
  return 3600 * 1000 * 24;
}

function filterNodes() {
  // var starttime = Date.now();
  var minTime = xScale.domain()[0].getTime();
  var maxTime = xScale.domain()[1].getTime();
  var infSlider = document.getElementById('infSlider').noUiSlider;

  for (var i = 0; i < nodes.length; i++) {
    nodes[i].startInfluence = xScale.domain()[1];
  }
  for (var tick = minTime; tick < maxTime; tick += aDay() * 30) {
    var egoViewSum = calculateViewCount(tick);
    for (var i = 0; i < links.length; i++) {
      var d = links[i];
      var curTime = new Date(tick);
      if (
        d.source.startInfluence > curTime &&
        d.target.id == egoID &&
        d.fluxSum > (infSlider.get() / 100.0) * egoViewSum
      ) {
        d.source.startInfluence = curTime;
      }
    }
  }
  // console.log("filterNodes", Date.now()-starttime);
}

function nodeSize(d, curTime) {
  if (curTime == undefined) return d.totalView;
  for (var i = 0; i < d.dailyView.length; i += 10) {
    var date = new Date(d.startDate.getTime() + aDay() * i);
    if (date.getTime() > curTime) break;
  }
  return d.dailyView.slice(0, i).reduce((a, b) => a + b, 0);
}

function linkWeight(d, egoViewSum, curTime) {
  if (curTime == undefined) return d.flux;
  for (var i = 0; i < d.dailyFlux.length; i += 10) {
    var date = new Date(d.startDate.getTime() + aDay() * i);
    if (date.getTime() > curTime) break;
  }
  return d.dailyFlux.slice(0, i).reduce((a, b) => a + b, 0);
}

function arraysum(total, num) {
  return total + num;
}

function linkArc(d) {
  var px1 = padding_x + xScale(d.source.startInfluence);
  var px2 = padding_x + xScale(d.target.startInfluence);
  var py1, py2;
  var sortingOpt = graphSortingOpts[graphSorting.value];
  if (sortingOpt == 'Force Directed') {
    py1 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.source.y)
    );
    py2 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.target.y)
    );
  } else if (sortingOpt == 'Total View') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.viewSum)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.viewSum)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (sortingOpt == 'Artist Name') {
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
  }
  if (d.target.id == egoID) {
    px2 = padding_x + xScale(egoTime);
  }

  var dx = px2 - px1,
    dy = py2 - py1,
    dr = Math.sqrt(dx * dx + dy * dy);
  if (d.label == '') dr = 10000;
  return (
    'M' + px1 + ',' + py1 + 'A' + dr + ',' + dr + ' 0 0,1 ' + px2 + ',' + py2
  );
}

function hideOtherSongViewCount(othersong) {
  viewcount.select('line#otherIndicator').attr('display', 'none');
  visinfo.select('rect#otherInfobox').attr('display', 'none');
  visinfo.select('text#otherInfobox').attr('display', 'none');
  var incoming = d3.select('path#' + othersong.id + egoID);
  if (incoming) {
    incoming.attr('stroke', '#aaa').attr('stroke-opacity', 0.5);
  }
  var outgoing = d3.select('path#' + egoID + othersong.id);
  if (outgoing) {
    outgoing.attr('stroke', '#aaa').attr('stroke-opacity', 0.5);
  }

  yScale.domain([0, oldMaxView]);
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
  var startDate = new Date(othersong.startDate);

  var edgeToEgo = d3.select('path#' + othersong.id + egoID);
  var viewToEgo = 0;
  if (edgeToEgo.data()[0]) {
    edgeToEgo.attr('stroke', 'blue').attr('stroke-opacity', 1);
    viewToEgo = parseInt(edgeToEgo.data()[0].fluxSum).toLocaleString();
  }
  var edgeFromEgo = d3.select('path#' + egoID + othersong.id);
  var viewFromEgo = 0;
  if (edgeFromEgo.data()[0]) {
    edgeFromEgo.attr('stroke', 'red').attr('stroke-opacity', 1);
    viewFromEgo = parseInt(edgeFromEgo.data()[0].fluxSum).toLocaleString();
  }

  var otherNode = d3.select('circle#' + othersong.id).node();
  var xpos = xScale(startDate);
  var xpos_infoText = padding_x + xpos + 15;
  var ypos = -90 + parseFloat(d3.select(otherNode.parentNode).attr('cy'));
  if (ypos < chart_topMargin) {
    ypos += 180;
  }
  viewcount
    .select('line#otherIndicator')
    .attr('x1', xpos)
    .attr('x2', xpos)
    .attr('display', 'block');
  var infotext = visinfo
    .select('text#otherInfobox')
    .attr('y', ypos)
    .attr('display', 'block')
    .html(
      '<tspan x="' +
        xpos_infoText +
        '" dy="0" font-weight="bold">' +
        othersong.name +
        '</tspan><tspan x="' +
        xpos_infoText +
        '" dy="15">' +
        numFormatter(othersong.viewSum) +
        ' views (' +
        startDate.toShortFormat() +
        ' ~ ' +
        new Date(egoTime).toShortFormat() +
        ')</tspan><tspan x="' +
        xpos_infoText +
        '" dy="15">Contribute <tspan style="fill:blue">' +
        viewToEgo +
        '</tspan> views</tspan><tspan x="' +
        xpos_infoText +
        '" dy="15">Receive <tspan style="fill:red">' +
        viewFromEgo +
        '</tspan> views</tspan>'
    );

  var textWidth = infotext.node().getBBox().width;
  visinfo
    .select('rect#otherInfobox')
    .attr('x', xpos_infoText - 10)
    .attr('y', ypos - 15)
    .attr('width', textWidth + 20)
    .attr('height', 70)
    .attr('display', 'block');

  var data = [];
  for (var i = 0; i < othersong.dailyView.length; i++) {
    data.push({
      date: new Date(startDate.getTime() + aDay() * i),
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
    .attr('class', 'viewcount_other')
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

export default AttentionFlow;

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
  mouse.x -= padding_x * 2;
  // console.log(mouse)
}
