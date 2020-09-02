import * as d3 from 'd3';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class WikiFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      clickedVideoID: null,
    };
  }

  componentDidMount() {
    this.drawWikiGraph();
  }

  drawWikiGraph() {
    const data = {
      nodes: this.props.wikiGraph.nodes.map(a => ({ ...a })),
      edges: this.props.wikiGraph.edges.map(a => ({ ...a })),
    };

    const attnColor = d3.scaleSequential(d3.interpolateBlues).domain([0, 0.05]);
    const edgeWidth = d3
      .scaleLinear()
      .domain([0, 0.04])
      .range([0, 4.5]);
    const nodeWidth = 90;
    const nodeHeight = 60;
    const layerHeight = 30;

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 30 },
      width = 1100 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    d3.select(this.refs.canvas)
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    var g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .append('defs')
      .selectAll('marker')
      .data(['end']) // Different link/path types can be defined here
      .enter()
      .append('marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', '#aaa');

    var link = g
      .selectAll('line3')
      .data(data.edges)
      .enter()
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', n => edgeWidth(n.attn))
      .attr('marker-end', 'url(#end)');

    // Initialize the nodes
    var node = g
      .selectAll('rect2')
      .data(data.nodes)
      .enter()
      .append('rect')
      .attr('width', n => {
        if (n.kind === 'concat') {
          return 30;
        } else {
          return nodeWidth;
        }
      })
      .attr('height', n => {
        if (n.kind === 'alter' || n.kind == 'ego') {
          return nodeHeight;
        } else if (n.kind === 'decomposition') {
          return layerHeight;
        } else if (n.kind === 'module') {
          return nodeWidth;
        } else if (n.kind === 'forecast') {
          return nodeHeight;
        } else if (n.kind === 'concat') {
          return 30;
        }
      })
      .attr('stroke', '#000')
      .attr('stroke-width', n => (n.kind === 'module' ? 1 : 1))
      .style('fill', n => {
        if (n.id === 'network') {
          return '#c6d9ec';
        } else if (n.id === 'model') {
          return '#ffdb99';
        }
        if (n.kind === 'concat') {
          return '#d4d4d4';
        } else {
          return 'white';
        }
      })
      .attr('rx', n => {
        if (n.kind === 'module') {
          return 20;
        }
        if (n.kind === 'concat') {
          return 100;
        } else {
          return 0;
        }
      })
      .attr('ry', n => {
        if (n.kind === 'module') {
          return 20;
        }
        if (n.kind === 'concat') {
          return 100;
        } else {
          return 0;
        }
      });

    // Let's list the force we wanna apply on the network
    var simulation = d3
      .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
      .force(
        'link',
        d3
          .forceLink() // This force provides links between nodes
          .id(function(d) {
            return d.id;
          }) // This provide  the id of a node
          .distance(50)
          .strength(0.1)
          .links(data.edges) // and this the list of links
      )
      .force('charge', d3.forceManyBody().strength(-1000)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force('center', d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
      .on('tick', ticked);
    // .start();

    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragging)
        .on('end', dragended)
    );

    var path1 = g
      .selectAll('path')
      .data(data.nodes)
      .enter()
      .append('path')
      .attr('fill', n => {
        if (n.kind == 'alter') {
          return '#c6d9ec';
        } else if (n.kind == 'ego') {
          return '#ffdb99';
        } else if (n.kind == 'decomposition') {
          return 'orange';
        } else if (n.kind == 'forecast') {
          return 'orange';
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('stroke', 'black');

    var path2 = g
      .selectAll('path2')
      .data(data.nodes)
      .enter()
      .append('path')
      .attr('fill', n => {
        if (n.kind == 'alter') {
          return '#6699cc';
        } else if (n.kind == 'ego') {
          return 'orange';
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('stroke', 'black');

    const text = g
      .selectAll('.label')
      .data(data.nodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .style('text-anchor', 'middle')
      .style('fill', '#555')
      .style('font-family', 'Helvetica')
      .style('font-size', n => {
        if (n.kind == 'concat') {
          return 40;
        } else if (n.kind == 'decomposition') {
          return 10;
        } else {
          return 14;
        }
      });

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      link
        .attr('x1', function(d) {
          return d.source.x + nodeWidth / 2;
        })
        .attr('y1', function(d) {
          return d.source.y + nodeHeight / 2;
        })
        .attr('x2', function(d) {
          let halfHeight = nodeHeight / 2;
          var inter = pointOnRect(
            d.source.x,
            d.source.y,
            d.target.x - nodeWidth / 2,
            d.target.y - halfHeight,
            d.target.x + nodeWidth / 2,
            d.target.y + halfHeight
          );
          return inter.x + nodeWidth / 2;
        })
        .attr('y2', function(d) {
          let halfHeight = nodeHeight / 2;
          var inter = pointOnRect(
            d.source.x,
            d.source.y,
            d.target.x - nodeWidth / 2,
            d.target.y - halfHeight,
            d.target.x + nodeWidth / 2,
            d.target.y + halfHeight
          );
          return inter.y + halfHeight;
        });

      node.attr('transform', function(d) {
        // Ensure that nodes don't flow off the grid
        d.x = Math.max(100, Math.min(width - 100, d.x));
        d.y = Math.max(100, Math.min(height - 100, d.y));
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      path1.attr('d', function(n, i) {
        if (n.kind == 'module' || n.kind == 'concat') {
          return;
        }
        let xDomain = [0, 140];
        let xRange = [n.x, n.x + nodeWidth];
        let yDomain = [0, d3.max(n.series) * 1.05];
        let height = nodeHeight;
        let yRange = [n.y + height, n.y];
        let series = n.series.slice(0, -28);
        if (n.kind === 'decomposition') {
          xDomain = [0, 28];
          yDomain = [d3.min(n.series), d3.max(n.series) * 1.05];
          height = layerHeight;
          yRange = [n.y + height, n.y];
          series = n.series;
        } else if (n.kind === 'forecast') {
          xDomain = [0, 28];
          xRange = [n.x + nodeWidth - 28, n.x + nodeWidth];
          yDomain = [d3.min(n.series), d3.max(n.series) * 1.05];
          height = nodeHeight;
          yRange = [n.y + height, n.y];
          series = n.series;
        }

        var x = d3
          .scaleLinear()
          .domain(xDomain)
          .range(xRange);
        var y = d3
          .scaleLinear()
          .domain(yDomain)
          .range(yRange);
        return d3
          .area()
          .x(function(d, pos) {
            return x(pos);
          })
          .y1(function(d) {
            return y(d);
          })
          .y0(n.y + height)(series);
      });

      path2.attr('d', function(n, i) {
        if (
          n.kind == 'module' ||
          n.kind == 'concat' ||
          n.kind == 'decomposition' ||
          n.kind == 'forecast'
        ) {
          return;
        }
        let xDomain = [0, 140];
        let xRange = [n.x, n.x + nodeWidth];
        let yDomain = [0, d3.max(n.series) * 1.05];
        let height = nodeHeight;
        let yRange = [n.y + height, n.y];
        let series = n.series.slice(-29);

        var x = d3
          .scaleLinear()
          .domain(xDomain)
          .range(xRange);
        var y = d3
          .scaleLinear()
          .domain(yDomain)
          .range(yRange);
        return d3
          .area()
          .x(function(d, pos) {
            return x(pos + 111);
          })
          .y1(function(d) {
            return y(d);
          })
          .y0(n.y + height)(series);
      });

      text
        .attr('x', d => {
          if (d.kind == 'concat') {
            return d.x + 15;
          }

          return d.x + nodeWidth / 2;
        })
        .attr('y', d => {
          if (d.kind == 'module') {
            return d.y + nodeWidth / 2 - 5;
          }
          if (d.kind == 'concat') {
            return d.y + 26;
          } else if (d.kind == 'decomposition') {
            return d.y + 10;
          } else {
            return d.y - 10;
          }
        });
    }

    g.append('rect')
      .attr('x', 890)
      .attr('y', 440)
      .attr('width', 110)
      .attr('height', 80)
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .style('stroke-dasharray', '5,5')
      .style('fill', 'none');

    svg
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#end)')
      .attr('x1', 925)
      .attr('y1', 460)
      .attr('x2', 950)
      .attr('y2', 460);

    svg
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#end)')
      .attr('x1', 925)
      .attr('y1', 477)
      .attr('x2', 950)
      .attr('y2', 477);

    svg
      .append('circle')
      .attr('cx', 930)
      .attr('cy', 500)
      .attr('r', 6)
      .style('fill', '#c6d9ec');
    svg
      .append('circle')
      .attr('cx', 945)
      .attr('cy', 500)
      .attr('r', 6)
      .style('fill', '#ffdb99');

    svg
      .append('circle')
      .attr('cx', 930)
      .attr('cy', 520)
      .attr('r', 6)
      .style('fill', '#6699cc');
    svg
      .append('circle')
      .attr('cx', 945)
      .attr('cy', 520)
      .attr('r', 6)
      .style('fill', 'orange');

    svg
      .append('text')
      .attr('x', 955)
      .attr('y', 461)
      .text('less attention')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 955)
      .attr('y', 478)
      .text('more attention')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 955)
      .attr('y', 500)
      .text('backcast period')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');
    svg
      .append('text')
      .attr('x', 955)
      .attr('y', 520)
      .text('forecast period')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragging(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
    }

    /**
     * Finds the intersection point between
     *     * the rectangle
     *       with parallel sides to the x and y axes
     *     * the half-line pointing towards (x,y)
     *       originating from the middle of the rectangle
     *
     * Note: the function works given min[XY] <= max[XY],
     *       even though minY may not be the "top" of the rectangle
     *       because the coordinate system is flipped.
     *
     * @param (x,y):Number point to build the line segment from
     * @param minX:Number the "left" side of the rectangle
     * @param minY:Number the "top" side of the rectangle
     * @param maxX:Number the "right" side of the rectangle
     * @param maxY:Number the "bottom" side of the rectangle
     * @param check:boolean (optional) whether to treat point inside the rect as error
     * @return an object with x and y members for the intersection
     * @throws if check == true and (x,y) is inside the rectangle
     * @author TWiStErRob
     * @see <a href="https://stackoverflow.com/a/31254199/253468">source</a>
     * @see <a href="https://stackoverflow.com/a/18292964/253468">based on</a>
     */
    function pointOnRect(x, y, minX, minY, maxX, maxY, check) {
      //assert minX <= maxX;
      //assert minY <= maxY;
      if (check && minX <= x && x <= maxX && minY <= y && y <= maxY)
        throw 'Point ' +
          [x, y] +
          'cannot be inside ' +
          'the rectangle: ' +
          [minX, minY] +
          ' - ' +
          [maxX, maxY] +
          '.';
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      if (midX - x == 0) {
        return {
          x: minX,
          y: minY,
        };
      }

      // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
      const m = (midY - y) / (midX - x);

      if (x <= midX) {
        // check "left" side
        const minXy = m * (minX - x) + y;
        if (minY <= minXy && minXy <= maxY)
          return {
            x: minX,
            y: minXy,
          };
      }

      if (x >= midX) {
        // check "right" side
        const maxXy = m * (maxX - x) + y;
        if (minY <= maxXy && maxXy <= maxY)
          return {
            x: maxX,
            y: maxXy,
          };
      }

      if (y <= midY) {
        // check "top" side
        const minYx = (minY - y) / m + x;
        if (minX <= minYx && minYx <= maxX)
          return {
            x: minYx,
            y: minY,
          };
      }

      if (y >= midY) {
        // check "bottom" side
        const maxYx = (maxY - y) / m + x;
        if (minX <= maxYx && maxYx <= maxX)
          return {
            x: maxYx,
            y: maxY,
          };
      }

      // Should never happen :) If it does, please tell me!
      throw 'Cannot find intersection for ' +
        [x, y] +
        ' inside rectangle ' +
        [minX, minY] +
        ' - ' +
        [maxX, maxY] +
        '.';
    }
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      console.log(this.state);
      return (
        <Redirect
          push
          to={`/overview/${this.props.egoType == 'A' ? 'artist' : 'video'}/${
            this.state.clickedVideoID
          }`}
        />
      );
    }
    return <div ref="canvas" />;
  }
}

export default WikiFlow;
