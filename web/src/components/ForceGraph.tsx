"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (slug: string) => void;
  activeNode?: string | null;
}

export default function ForceGraph({ nodes, links, onNodeClick, activeNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const handleResize = useCallback(() => {
    if (!svgRef.current) return;
    const parent = svgRef.current.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    d3.select(svgRef.current).attr("viewBox", `0 0 ${w} ${h}`);
    simulationRef.current?.force("center", d3.forceCenter(w / 2, h / 2));
    simulationRef.current?.alpha(0.3).restart();
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const parent = svgRef.current.parentElement!;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#475569")
      .attr("d", "M0,-5L10,0L0,5");

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrow)");

    const node = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_event, d) => onNodeClick(d.id))
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d) => CATEGORY_COLORS[d.category] || "#64748b")
      .attr("stroke", (d) =>
        activeNode === d.id ? "#fff" : CATEGORY_COLORS[d.category] || "#64748b"
      )
      .attr("stroke-width", (d) => (activeNode === d.id ? 3 : 1.5))
      .attr("stroke-opacity", 0.5)
      .style("transition", "stroke 0.2s, stroke-width 0.2s");

    node
      .append("text")
      .text((d) => d.title)
      .attr("dy", 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px")
      .attr("font-weight", 500)
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)");

    const tooltip = d3.select(tooltipRef.current);

    node
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.title}</strong><br/><span style="color:${CATEGORY_COLORS[d.category]}">${d.category}</span>`
          )
          .style("left", event.offsetX + 12 + "px")
          .style("top", event.offsetY - 8 + "px");
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.offsetX + 12 + "px").style("top", event.offsetY - 8 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as unknown as GraphNode).x!)
        .attr("y1", (d) => (d.source as unknown as GraphNode).y!)
        .attr("x2", (d) => (d.target as unknown as GraphNode).x!)
        .attr("y2", (d) => (d.target as unknown as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, [nodes, links, onNodeClick, activeNode, handleResize]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-surface-500 text-sm">
        Nessuna pagina trovata
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      <div ref={tooltipRef} className="graph-tooltip opacity-0" />
    </div>
  );
}
