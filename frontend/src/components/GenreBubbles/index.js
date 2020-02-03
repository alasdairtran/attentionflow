import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import SongEgo from '../SongEgo';
import { getSongEgo } from '../SongEgo/songEgo';

class GenreBubbles extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    this.drawGenreBubbles(oWidth);
  }

  drawGenreBubbles(oWidth) {
    let root = this.props.root;

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
        if (d !== root) d3.select(this).style('stroke-width', '1.5px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('stroke-width', '0px');
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
        console.log(d.data.name);
        //d3.select('#graphContainer').html('<div style="width:50px;height:50px;border:10px solid #f3f3f3;borderRadius:50%;borderTop:10px solid #3498db;animation:spin 2s linear infinite;margin:100px auto"/>');
        svg.selectAll('*').remove();
        getSongEgo(d.data.name, svg, tooltip);
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
