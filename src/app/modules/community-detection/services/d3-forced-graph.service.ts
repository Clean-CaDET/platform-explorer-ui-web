import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class D3ForcedGraphService {
  constructor() {}

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
