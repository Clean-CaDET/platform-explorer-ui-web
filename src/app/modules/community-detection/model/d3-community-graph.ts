import * as d3 from 'd3';
import { Link } from './link';
import { ProjectNode } from './project-node';

export class D3CommunityGraph {
  width: number;
  height: number;
  simulation: any;
  color: any;
  links: any;
  nodes: any;
  circles: any;
  labels: any;
  radius: number;
  projectLinks: Link[] = [];

  constructor(obj: any) {
    this.width = obj.width;
    this.height = obj.height;
    this.color = obj.color;
    this.radius = obj.radius;
  }

  public initGraph(svg: any, projectLinks: Link[], projectNodes: ProjectNode[], fullProject: boolean) {
    this.initSimulation(projectNodes, projectLinks);
    if (fullProject) this.calculatePositionsWithoutDrawing();
    this.initLinks(svg, projectLinks);
    this.initNodes(svg, projectNodes);
    this.projectLinks = projectLinks;
    this.initCircles(svg);
    this.initLabeles();
    this.initTitle();
    if (!fullProject) this.startSimulation(projectNodes, projectLinks);
  }

  public calculatePositionsWithoutDrawing() {
    for (let i = 0; i < 350; ++i) this.simulation.tick();
    this.simulation.stop();
  }

  public initSimulation(projectNodes: any, projectLinks: any) {
    this.simulation = d3
      .forceSimulation(projectNodes)
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
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('attraceForce', d3.forceManyBody().strength(-1000).distanceMax(1000));
    this.simulation.force('link').links(projectLinks);
  }

  public initLinks(svg: any, projectLinks: Link[]) {
    const self = this;
    this.links = svg
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
        return self.color(d.group);
      });
  }

  public initNodes(svg: any, projectNodes: ProjectNode[]) {
    this.nodes = svg.append('g').attr('class', 'nodes').selectAll('g').data(projectNodes).enter().append('g');
  }

  public initCircles(svg: any) {
    const self = this;

    var grad = svg.append("defs").append("linearGradient").attr("id", "grad")
              .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
            grad.append("stop").attr("offset", "50%").style("stop-color", "#008000");
            grad.append("stop").attr("offset", "50%").style("stop-color", "#ffa500");

    this.circles = this.nodes
      .append('circle')
      .attr('r', 20)
      .attr('cx', function (d: any) {
        return (d.x = Math.max(self.radius, Math.min(self.width - self.radius, d.x)));
      })
      .attr('cy', function (d: any) {
        return (d.y = Math.max(self.radius, Math.min(self.height - self.radius, d.y)));
      })
      .attr('fill', function (d: any) {
        if (d.group == 0) return '#FF0000';
        else if (d.group == 1) return '#ffa500';
        else if (d.group == 2) return "#008000";
        else if (d.group == 3) return '#65b8ec';
        else return "url(#grad)";
      })
      .style('stroke-width', 5)
      .style('stroke', function (d: any) {
        if (d.type === 'field') return '#DE3163';
        else return '#FFBF00';
      })
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    function dragstarted(d: any) {
      if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: any) {
      if (!d3.event.active) self.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  public initLabeles() {
    const self = this;
    this.labels = self.nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y;
      })
      .text(function (d: any) {
        if (d.group == 0) return d.id;

        var links: Link[] = [];
        self.projectLinks.forEach(l => {
          var target = l.target as unknown as ProjectNode;
          if (target.fullName == d.fullName) links.push(l);
        });
        
        var sumOfWeights = 0;
        links.forEach(link => {
          sumOfWeights += link.weight!;
        });
        return d.id + "(" + sumOfWeights + ")";
      });
  }

  public initTitle() {
    const self = this;
    self.nodes.append('title').text(function (d: any) {
      return d.id;
    });
  }

  public startSimulation(projectNodes: any, projectLinks: any) {
    this.simulation.nodes(projectNodes).on('tick', ticked);
    this.simulation.force('link').links(projectLinks);
    const self = this;
    function ticked() {
      self.links
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
      self.circles
        .attr('cx', function (d: any) {
          return (d.x = Math.max(self.radius, Math.min(self.width - self.radius, d.x)));
        })
        .attr('cy', function (d: any) {
          return (d.y = Math.max(self.radius, Math.min(self.height - self.radius, d.y)));
        });
      self.labels
        .attr('x', function (d: any) {
          return d.x;
        })
        .attr('y', function (d: any) {
          return d.y;
        });
    }
  }
}
