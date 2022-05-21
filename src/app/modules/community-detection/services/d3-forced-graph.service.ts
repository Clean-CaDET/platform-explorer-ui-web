import { Injectable } from '@angular/core';
import { ProjectNode } from '../model/project-node';
import * as d3 from 'd3';
import { Link } from '../model/link';

@Injectable({
  providedIn: 'root',
})
export class D3ForcedGraphService {
  constructor() {}

  initSimulation(width: number, height: number, nodes: any, links: any, initialSimulation: boolean = false) {
    let sim: any = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink()
          .id(function (d: any) {
            return d.id;
          })
          .distance(90)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('attraceForce', d3.forceManyBody().strength(-1000).distanceMax(1000));
    sim.force('link').links(links);
    return sim;
  }

  initLinks(color: any, svg: any, projectLinks: Link[]) {
    return svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(projectLinks)
      .enter()
      .append('line')
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      })
      .attr('stroke-width', function (d: any) {
        return 0.3 * d.weight;
      })
      .attr('stroke', function (d: any) {
        return color(d.group);
      });
  }

  initNodes(svg: any, projectNodes: ProjectNode[]) {
    return svg.append('g').attr('class', 'nodes').selectAll('g').data(projectNodes).enter().append('g');
  }

  initCircles(nodes: any, color: any, simulation: any, radius: number, width: number, height: number) {
    return nodes
      .append('circle')
      .attr('r', 20)
      .attr('cx', function (d: any) {
        return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
      })
      .attr('cy', function (d: any) {
        return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
      })
      .attr('fill', function (d: any) {
        return color(d.group);
      })
      .style('stroke-width', 5)
      .style('stroke', function (d: any) {
        if (d.type === 'field') return '#DE3163';
        else return '#FFBF00';
      })
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    function dragstarted(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  initLabeles(nodes: any) {
    return nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y;
      })
      .text(function (d: any) {
        return d.id;
      });
  }

  initTitle(nodes: any) {
    nodes.append('title').text(function (d: any) {
      return d.id;
    });
  }

  startSimulation(
    simulation: any,
    projectNodes: any,
    projectLinks: any,
    links: any,
    circles: any,
    labels: any,
    radius: number,
    width: number,
    height: number
  ) {
    simulation.nodes(projectNodes).on('tick', ticked);
    simulation.force('link').links(projectLinks);
    function ticked() {
      links
        .attr('x1', function (d: any) {
          return d.source.x;
        })
        .attr('y1', function (d: any) {
          return d.source.y;
        })
        .attr('x2', function (d: any) {
          return d.target.x;
        })
        .attr('y2', function (d: any) {
          return d.target.y;
        });
      circles
        .attr('cx', function (d: any) {
          return (d.x = Math.max(radius, Math.min(width - radius, d.x)));
        })
        .attr('cy', function (d: any) {
          return (d.y = Math.max(radius, Math.min(height - radius, d.y)));
        });
      labels
        .attr('x', function (d: any) {
          return d.x;
        })
        .attr('y', function (d: any) {
          return d.y;
        });
    }
  }

  zoomFit(g: any, svg: any, zoom: any) {
    var bounds = g.node().getBBox();
    var parent = g.node().parentElement;
    var fullWidth = parent.clientWidth || parent.parentNode.clientWidth,
      fullHeight = parent.clientHeight || parent.parentNode.clientHeight;
    var width = bounds.width,
      height = bounds.height;
    var midX = bounds.x + width / 1.8,
      midY = bounds.y + height / 1.6;
    if (width == 0 || height == 0) return;
    var scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
    var transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
    g.call(zoom.transform, transform);
    svg.call(zoom.transform, transform);
  }
}
