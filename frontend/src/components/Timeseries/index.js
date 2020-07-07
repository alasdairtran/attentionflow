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
let rightMargin = 50;
let chart_yScale_minimum = 100000;
let chart_xScale_minimum = new Date('2009-11-01');
let egoNode, egoID, egoType, egoTime, simulation, nodes, links;
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
const minStroke = 1;
const maxStroke = 20;
const maxRadius = 50;
const minRadius = 10;

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
    egoNode = this.props.egoInfo;
    // console.log('egoNode', egoNode, this.props.egoType);

    egoType = this.props.egoType;
    egoID = stringfy(egoNode.id);

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

    this.drawEgoInfoCard();
    this.drawEgoViewCount();
    this.drawEgoNetwork();
    this.drawTimeSelector();

    if (egoType == 'V') infSlider.noUiSlider.set(1);
    else if (egoType == 'A') infSlider.noUiSlider.set(5);
  }

  drawTimeSelector() {
    var old = document.getElementById('timeRange');
    if (old) old.remove();

    var range = document.createElement('div');
    range.id = 'timeRange';
    range.style.width = this.canvasWidth - padding_x * 2 - rightMargin + 'px';
    range.style.top = this.chartHeight + 30 + 'px';
    range.style.left = padding_x + maxRadius + 'px';
    this.divTimeline.append(range);

    var egoStartDate = egoNode.startDate;
    var minTime = xScale.domain()[0].getTime();
    var maxTime = xScale.domain()[1].getTime();
    noUiSlider.create(range, {
      range: {
        min: minTime,
        max: maxTime,
      },
      connect: true,
      step: aDay(), // A day
      padding: [egoStartDate - minTime, aDay()],
      start: [egoStartDate, parseInt(minTime + (maxTime - minTime) * 0.98)],
    });

    var start_indicator = viewcount
      .append('line')
      .attr('id', 'startIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');
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
    var time_cover_l = viewcount
      .append('rect')
      .attr('id', 'timeCover_left')
      .attr('class', 'timeCover')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', this.chartHeight + 525);
    var time_cover_r = viewcount
      .append('rect')
      .attr('id', 'timeCover_right')
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

    range.noUiSlider.on('update', function(
      values,
      handle,
      unencoded,
      isTap,
      positions
    ) {
      if (handle == 0) {
        // left handle
        var m_pos = xScale(values[0]);
        start_indicator
          .attr('x1', m_pos)
          .attr('x2', m_pos)
          .attr('display', 'block');
        time_cover_l.attr('width', m_pos);
      } else if (handle == 1) {
        // right handle
        var m_pos = xScale(values[1]);
        egoTime = parseInt(values[1]);
        time_indicator
          .attr('x1', m_pos)
          .attr('x2', m_pos)
          .attr('display', 'block');
        var chartWidth = document
          .getElementById('timeRange')
          .getBoundingClientRect().width;
        time_cover_r.attr('x', m_pos + 1).attr('width', chartWidth - m_pos);

        var egoCircle = d3.select('circle#' + egoID);
        var ego_ypos = d3.select(egoCircle.node().parentNode).attr('cy');
        var pos_y = (pos_y = 30 + parseFloat(ego_ypos));
        var viewSum = egoCircle.data()[0].viewSum;
        egoInfoBox
          .attr('y', pos_y)
          .html(
            '<tspan x="' +
              (maxRadius + m_pos + 15) +
              '" dy="0">' +
              numFormatter(viewSum) +
              ' views</tspan>' +
              '<tspan x="' +
              (maxRadius + m_pos + 15) +
              '" dy="15">' +
              new Date(egoTime).toShortFormat() +
              '</tspan>'
          );
      }
      calculateViewCount(values[0], egoTime);
      filterNodes();
      simulation.restart();
    });
  }

  drawEgoInfoCard() {
    // Set ego title
    this.divTitle.innerHTML = '<h5><b>' + egoNode.title + '</b></h5>';

    // update ego information
    this.divInfo.innerHTML = '';
    var infocard = document.createElement('div');
    infocard.setAttribute('id', 'egoInfoCard');

    var published = new Date(egoNode.publishedAt);
    var infocardtext = document.createElement('div');

    var egoInfoText = '';
    if (egoType == 'A') {
      egoInfoText += 'First song published: ' + published.toShortFormat();
      egoInfoText += '</br>Total views: ' + numFormatter(egoNode.totalView);
      infocardtext.innerHTML = egoInfoText;
      infocard.append(infocardtext);
      this.divInfo.append(infocard);
      this.addTopVideos(this.divInfo);
    } else if (egoType == 'V') {
      this.addVideoThumbnail(this.divInfo);
      egoInfoText += 'Published: ' + published.toShortFormat();
      egoInfoText += '</br>Genres: ' + egoNode.genres.join(',');
      infocardtext.innerHTML = egoInfoText;
      infocard.append(infocardtext);
      this.divInfo.append(infocard);
    }

    var controlPanel = document.createElement('div');
    controlPanel.id = 'controlPanel';

    var infSliderLabel = document.createElement('div');
    infSlider = document.createElement('div');
    infSlider.id = 'infSlider';
    noUiSlider.create(infSlider, {
      range: {
        min: 0,
        max: 20,
      },
      step: 1,
      start: 1,
      pips: { mode: 'count', values: 5 },
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
      var infVal = parseInt(infSlider.noUiSlider.get());
      infSliderLabel.innerHTML =
        '<b>Show videos with influence greater than (' + infVal + '%)</b>';
      filterNodes();
      simulation.restart();
    });

    var graphSortingLabel = document.createElement('div');
    graphSortingLabel.innerHTML = '<b>Sort along y-axis by</b>';

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

  addVideoThumbnail(div) {
    var embvideo_id;
    var embvideo = document.createElement('iframe');
    if (egoType == 'V') {
      embvideo_id = egoNode.id;
    } else if (egoType == 'A') {
      embvideo_id = stringfy(egoNode.topvideos[0][0][0]);
    }
    var videoWidth = div.offsetWidth - 60;
    embvideo.width = videoWidth;
    embvideo.height = 0.6 * videoWidth;
    embvideo.style.border = 'none';
    embvideo.style.margin = '20px 0 0 30px';
    embvideo.src = 'https://www.youtube.com/embed/' + embvideo_id;
    embvideo.src +=
      '?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    div.append(embvideo);
  }

  addTopVideos(div) {
    topVideos = {};
    var topvideos = document.createElement('div');
    topvideos.innerHTML = '<b>Top Songs</b><br/>';
    topvideos.style.padding = '0 0 20px 30px';
    for (var i = 0, j = 0; i < egoNode.topvideos[0].length, j < 5; i++, j++) {
      var videodiv = document.createElement('div');
      var video = egoNode.topvideos[0][i];
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
      // videodiv.addEventListener('mouseover', function(e) {
      //   showOtherSongViewCount(topVideos[this.id]);
      // });
      // videodiv.addEventListener('mouseout', function(e) {
      //   hideOtherSongViewCount(topVideos[this.id]);
      // });
      topvideos.append(videodiv);
    }
    div.append(topvideos);
  }

  drawEgoViewCount() {
    viewcount = vis
      .append('g')
      .attr('transform', 'translate(' + maxRadius + ',' + 20 + ')');
    viewcount
      .append('rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'transparent');

    var publishedDate = new Date(egoNode.publishedAt);
    var startDate = new Date(egoNode.startDate);
    // console.log('startDate', egoNode.startDate, startDate);
    // console.log('drawEgoViewCount', startDate, egoNode.dailyView.length);

    var data = [];
    for (var i = 0; i < egoNode.dailyView.length; i++) {
      data.push({
        date: new Date(startDate.getTime() + aDay() * i),
        value: egoNode.dailyView[i],
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
  }

  drawEgoNetwork() {
    const songsArr = egoNode.nodes;
    const linksArr = egoNode.links;

    const strokeList = linksArr.map(link => link[2]);
    const viewsList = songsArr.map(d => d[2]);

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
      contributed: 0,
      received: 0,
    }));

    links = linksArr.map(video => ({
      id: stringfy(video[0] + '_' + video[1]),
      source: stringfy(video[0]),
      target: stringfy(video[1]),
      flux: video[2],
      startDate: new Date(video[3]),
      dailyFlux: video[4],
    }));

    chart_height = 475;
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
          .strength(0.001)
      )
      .force(
        'collision',
        d3
          .forceCollide()
          .radius(function(d) {
            return radiusScale(d.totalView) + 10;
          })
          .iterations(10)
      )
      .force(
        'center',
        d3.forceCenter(this.canvasWidth / 2, chart_topMargin + chart_height / 2)
      );

    var newDomain = [xScale.invert(0), xScale.invert(this.canvasWidth)];
    chart
      .append('g')
      .attr('transform', 'translate(' + maxRadius + ',' + chart_topMargin + ')')
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

    // defs
    //   .selectAll('marker')
    //   .data(links)
    //   .enter()
    //   .append('marker')
    //   .attr('id', d => 'arrow_' + d.target.id)
    //   .attr('markerWidth', '12')
    //   .attr('markerHeight', '12')
    //   .attr('markerUnits', 'userSpaceOnUse')
    //   .attr('viewBox', '0 -6 12 12')
    //   .attr('refX', d => 10 + d.target.radius)
    //   .attr('refY', d => -d.value / 2)
    //   .attr('orient', 'auto')
    //   .append('path')
    //   .attr('d', 'M0,-6L12,0L0,6')
    //   .style('fill', '#aaa');

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
      .attr('id', d => 'grad' + d.id);

    const gradColour = (d, offset) => {
      const nPoints = d.dailyView.length;
      const ts = parseInt((nPoints * (offset - 10)) / 100);
      const te = parseInt((nPoints * offset) / 100);
      const nViews = d.dailyView.slice(ts, te).reduce((a, b) => a + b, 0);
      const totalViews = d.totalView;
      const viewColourScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain([0, totalViews / 2]);
      return viewColourScale(nViews);
    };

    const offsets = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    var smoothness = 3;
    offsets.forEach(offset => {
      grads
        .append('stop')
        .attr('offset', `${offset - (10 - smoothness)}%`)
        .style('stop-color', d => gradColour(d, offset));
      grads
        .append('stop')
        .attr('offset', `${offset - smoothness}%`)
        .style('stop-color', d => gradColour(d, offset));
    });

    node
      .append('circle')
      .call(drag(simulation))
      .attr('id', d => d.id)
      .attr('class', 'node')
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
      // console.log(d);
      this.setState({
        clickedOnSong: true,
        clickedVideoID: d.id.substr(1),
      });
    });

    node.on('mouseover', function(d) {
      if (d.id == egoID) return;
      // d3.select(this)
      //   .raise()
      //   .select('circle')
      //   .style('fill', hcolor);
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
      } else if (
        sortingOpt == 'Total View' ||
        sortingOpt == 'Contributed' ||
        sortingOpt == 'Received'
      ) {
        chart_y
          .attr('display', 'block')
          .attr(
            'transform',
            'translate(' + (startPos + maxRadius) + ',' + chart_topMargin + ')'
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
            'translate(' + (startPos + maxRadius) + ',' + chart_topMargin + ')'
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
          if (d.isVisible && d.startInfluence.getTime() <= egoTime)
            return 'block';
          else return 'none';
        })
        .attr('cx', function(d) {
          if (d.id == egoID) return maxRadius + xScale(egoTime);
          if (d.startInfluence.getTime() <= egoTime) {
            return maxRadius + xScale(d.startInfluence);
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
          } else if (sortingOpt == 'Contributed') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.contributed))
            );
          } else if (sortingOpt == 'Received') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.received))
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
          var new_x = maxRadius + xScale(d.startInfluence);
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
          } else if (sortingOpt == 'Contributed') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.contributed));
          } else if (sortingOpt == 'Received') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.received));
          } else if (sortingOpt == 'Artist Name') {
            new_y =
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist);
          }
          if (d.id == egoID) {
            new_x = maxRadius + xScale(egoTime);
            // new_y = chart_topMargin;
          }
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('d', linkArc)
        .attr('stroke-width', d => d.value)
        .attr('display', function(d) {
          if (
            (d.source.isVisible &&
              d.target.isVisible &&
              d.source.startInfluence.getTime() <= egoTime &&
              d.target.startInfluence.getTime() <= egoTime) ||
            (d.source.isVisible &&
              d.source.startInfluence.getTime() <= egoTime &&
              d.target.id == egoID) ||
            (d.target.isVisible &&
              d.target.startInfluence.getTime() <= egoTime &&
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

function calculateViewCount(minTime, maxTime) {
  var egoViewSum;
  for (var i = 0; i < nodes.length; i++) {
    var n = document.getElementById(nodes[i].id);
    var viewSum = nodeSize(nodes[i], minTime, maxTime);
    var radius = radiusScale(viewSum);
    nodes[i]['viewSum'] = viewSum;
    nodes[i]['radius'] = radius;
    n.style.r = radius;
    if (nodes[i].id == egoID) egoViewSum = viewSum;
  }
  for (var i = 0; i < links.length; i++) {
    var fluxSum = linkWeight(links[i], minTime, maxTime);
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
  var minScale = xScale.domain()[0].getTime();
  var maxScale = xScale.domain()[1].getTime();
  var trange = getTimeSelection();
  var infSlider = document.getElementById('infSlider').noUiSlider;

  for (var i = 0; i < nodes.length; i++) {
    nodes[i].startInfluence = xScale.domain()[1];
    nodes[i].isVisible = false;
  }
  for (var tick = minScale; tick < maxScale; tick += aDay() * 30) {
    var egoViewSum = calculateViewCount(trange[0].getTime(), tick);
    for (var i = 0; i < links.length; i++) {
      var d = links[i];
      var curTime = new Date(tick);
      if (
        d.source.startInfluence > curTime &&
        d.target.id == egoID &&
        d.fluxSum > (infSlider.get() / 100.0) * egoViewSum
      ) {
        // console.log("D", d.source.name, d.source.startDate, curTime);
        d.source.startInfluence = curTime;
      }
    }
  }
  var egoViewSum = calculateViewCount(trange[0].getTime(), egoTime);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].contributed > (infSlider.get() / 100.0) * egoViewSum)
      nodes[i].isVisible = true;
  }
  // console.log("filterNodes", Date.now()-starttime);
}

function nodeSize(d, minTime, maxTime) {
  var startDate = d.startDate.getTime();
  var ts = Math.max(
    0,
    Math.min(d.dailyView.length, parseInt((minTime - startDate) / aDay()))
  );
  var te = Math.max(
    0,
    Math.min(d.dailyView.length, parseInt((maxTime - startDate) / aDay()))
  );
  return d.dailyView.slice(ts, te).reduce((a, b) => a + b, 0);
}

function linkWeight(d, minTime, maxTime) {
  var startDate = d.startDate.getTime();
  var ts = Math.max(
    0,
    Math.min(d.dailyFlux.length, parseInt((minTime - startDate) / aDay()))
  );
  var te = Math.max(
    0,
    Math.min(d.dailyFlux.length, parseInt((maxTime - startDate) / aDay()))
  );
  var sum = d.dailyFlux.slice(ts, te).reduce((a, b) => a + b, 0);
  d.source.contributed = d.target.received = sum;
  return sum;
}

function arraysum(total, num) {
  return total + num;
}

function linkArc(d) {
  var px1 = maxRadius + xScale(d.source.startInfluence);
  var px2 = maxRadius + xScale(d.target.startInfluence);
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
  } else if (sortingOpt == 'Contributed') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.contributed)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.contributed)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (sortingOpt == 'Received') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.received)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.received)
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
    px1 = maxRadius + xScale(egoTime);
  }
  if (d.target.id == egoID) {
    px2 = maxRadius + xScale(egoTime);
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
    incoming.attr('class', 'edge');
  }
  var outgoing = d3.select('path#' + egoID + othersong.id);
  if (outgoing) {
    outgoing.attr('class', 'edge');
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
  // console.log('othersong.id', othersong.id, egoID);
  var startDate = new Date(othersong.startDate);

  var edgeToEgo = d3.select('path#' + othersong.id + egoID);
  var viewToEgo = 0;
  if (edgeToEgo.data()[0]) {
    edgeToEgo.attr('class', 'edge incoming');
    viewToEgo = parseInt(edgeToEgo.data()[0].fluxSum).toLocaleString();
  }
  var edgeFromEgo = d3.select('path#' + egoID + othersong.id);
  var viewFromEgo = 0;
  if (edgeFromEgo.data()[0]) {
    edgeFromEgo.attr('class', 'edge outgoing');
    viewFromEgo = parseInt(edgeFromEgo.data()[0].fluxSum).toLocaleString();
  }

  var otherNode = d3.select('circle#' + othersong.id).node();
  var xpos = xScale(startDate);
  var xpos_infoText = maxRadius + xpos + 15;
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
