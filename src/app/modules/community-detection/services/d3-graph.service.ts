import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import * as d3 from "d3";import { GroupType } from "../model/enums/enums.model";
import { Link } from "../model/link";
import { ProjectNode } from "../model/project-node";
import { GraphDataService } from "./graph-data.service";
import { GraphService } from "./graph.service";

@Injectable({
    providedIn: 'root',
})
export class D3GraphService {
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
    projectNodes: ProjectNode[] = [];
    svg: any;

    constructor(private router: Router, private graphDataService: GraphDataService, 
      private graphService: GraphService) {}

    public setAttributes(obj: any) {
        this.width = obj.width;
        this.height = obj.height;
        this.color = obj.color;
        this.radius = obj.radius;
    }

    public initGraph(svg: any, projectLinks: Link[], projectNodes: ProjectNode[], fullProject: boolean, isNeighboursGraph: boolean) {
        this.initSimulation(projectNodes, projectLinks);
        if (fullProject) this.calculatePositionsWithoutDrawing();
        this.initLinks(svg, projectLinks);
        this.initNodes(svg, projectNodes);
        this.projectLinks = projectLinks;
        this.initCircles(svg, isNeighboursGraph);
        this.initLabeles(isNeighboursGraph);
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
    
      public initCircles(svg: any, isNeighboursGraph: boolean) {
        const self = this;
        var refAndRef = this.getRefAndRefColor(svg);
        var parentAndReferenced = this.getParentAndReferencedColor(svg);
        var parentAndReferences = this.getParentAndReferencesColor(svg);
        var parentAndRefAndRef = this.getParentAndRefAndRefColor(svg);
    
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
            if (isNeighboursGraph) return self.getGroupColor(d);
            return self.color(d.group);
          })
          .on("dblclick", (d:any) => {
            d3.event.preventDefault();
            this.showExtended(d);
          })
          .on("contextmenu", (d:any) => {
            d3.event.preventDefault();
            window.open(d.link, "_blank");
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

    private getRefAndRefColor(svg: any) {
      var refAndRef = svg.append("defs").append("linearGradient").attr("id", "refAndRef")
          .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        refAndRef.append("stop").attr("offset", "50%").style("stop-color", "#008000");
        refAndRef.append("stop").attr("offset", "50%").style("stop-color", "#ffa500");
      return refAndRef;
    }

    private getParentAndReferencedColor(svg: any) {
      var parentAndReferenced = svg.append("defs").append("linearGradient").attr("id", "parentAndReferenced")
        .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        parentAndReferenced.append("stop").attr("offset", "50%").style("stop-color", "#65b8ec");
        parentAndReferenced.append("stop").attr("offset", "50%").style("stop-color", "#ffa500");                
      return parentAndReferenced;
    }

    private getParentAndReferencesColor(svg: any) {
      var parentAndReferences = svg.append("defs").append("linearGradient").attr("id", "parentAndReferences")
        .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        parentAndReferences.append("stop").attr("offset", "50%").style("stop-color", "#65b8ec");
        parentAndReferences.append("stop").attr("offset", "50%").style("stop-color", "#008000");                
      return parentAndReferences;
    }

    private getParentAndRefAndRefColor(svg: any) {
      var parentAndRefAndRef = svg.append("defs").append("linearGradient").attr("id", "parentAndRefAndRef")
        .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        parentAndRefAndRef.append("stop").attr("offset", "33%").style("stop-color", "#65b8ec");
        parentAndRefAndRef.append("stop").attr("offset", "33%").style("stop-color", "#008000");                
        parentAndRefAndRef.append("stop").attr("offset", "33%").style("stop-color", "#ffa500");                
      return parentAndRefAndRef;
    }

    private getGroupColor(d: any) {
      if (d.group == GroupType.Main.toString()) return '#FF0000';
      else if (d.group == GroupType.Referenced.toString()) return '#FFA500';
      else if (d.group == GroupType.References.toString()) return "#008000";
      else if (d.group == GroupType.Parent.toString()) return '#65b8ec';
      else if (d.group == GroupType.ParentAndReferenced.toString()) return 'url(#parentAndReferenced)';
      else if (d.group == GroupType.ParentAndReferences.toString()) return 'url(#parentAndReferences)';
      else if (d.group == GroupType.ParentAndReferencedAndReferences.toString()) return 'url(#parentAndRefAndRef)';
      else return 'url(#refAndRef)';
    }
      
    showExtended(extendInstance: any) {
        var pathSegments = this.router.url.split('/');
        var projectId = pathSegments[4];

        this.graphDataService.getGraphInstanceWithNeighboursExtended(Number(projectId), extendInstance.fullName).then(graphInstance => {
          var graphData = this.graphService.getGraphBasedOnData(this.graphDataService.getGraphInstancesAndRelated(graphInstance));
          this.projectNodes = graphData.projectNodes;
          this.graphDataService.setNodeGroups(graphInstance, this.projectNodes);
          this.projectNodes = this.graphDataService.removeDuplicateNodes(this.projectNodes);
          this.projectLinks = graphData.projectLinks;
          this.initializeGraph();
        })
    }

    private initializeGraph() {
      this.initSvg();
      this.setAttributes({
        width: this.width,
        height: this.height,
        radius: 35,
        color: d3.scaleOrdinal(d3.schemeCategory20),
      });
      this.initGraph(this.svg, this.projectLinks, this.projectNodes, false, true);
    }

    private initSvg() {
      document.getElementById('neighboursGraphSvg')?.remove();
      this.svg = d3
        .select('#neighboursGraph')
        .append('svg')
        .attr('id', 'neighboursGraphSvg')
        .attr('width', '100%')
        .attr('height', 500);
      this.width = this.svg.node().getBoundingClientRect().width;
      this.height = this.svg.node().getBoundingClientRect().height;
    }

      public initLabeles(isNeighboursGraph: boolean) {
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
            if (d.group == GroupType.Main) return self.getClassNameFromPath(d.id);
    
            var links: Link[] = [];
            self.projectLinks.forEach(l => {
              var target = l.target as unknown as ProjectNode;
              if (target.fullName == d.fullName) links.push(l);
            });
            
            if (isNeighboursGraph) return self.idAndWeightsSum(d, links);
            return self.getClassNameFromPath(d.id);
          });
      }

      private idAndWeightsSum(d: any, links: Link[]) {
        var sumOfWeights = 0;
        links.forEach(link => {
          sumOfWeights += link.weight!;
        });
        return this.getClassNameFromPath(d.id) + "(" + sumOfWeights + ")";;
      }

      private getClassNameFromPath(fullName: string): string {
        const paths = fullName.split('.');
        return paths[paths.length - 1];
      }
    
      public initTitle() {
        const self = this;
        self.nodes.append('title').text(function (d: any) {
          return self.getClassNameFromPath(d.id);
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