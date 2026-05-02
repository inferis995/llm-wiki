"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import type { GraphNode, GraphLink } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (slug: string) => void;
  activeNode?: string | null;
}

function shortTitle(title: string, max = 20): string {
  if (title.length <= max) return title;
  return title.slice(0, max - 1) + "…";
}

export default function ForceGraph({ nodes, links, onNodeClick, activeNode }: Props) {
  const fgRef = useRef<any>(null);

  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of links) {
      const s = typeof l.source === "string" ? l.source : (l.source as any).id;
      const t = typeof l.target === "string" ? l.target : (l.target as any).id;
      if (s) counts[s] = (counts[s] || 0) + 1;
      if (t) counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [links]);

  // Build graph data with virtual links for disconnected nodes
  const graphData = useMemo(() => {
    // Find hub (most connected node)
    let hubId = nodes[0]?.id || "";
    let maxC = 0;
    for (const [id, c] of Object.entries(connectionCounts)) {
      if (c > maxC) { maxC = c; hubId = id; }
    }

    // Find which nodes have real connections
    const connected = new Set<string>();
    for (const l of links) {
      const s = typeof l.source === "string" ? l.source : (l.source as any).id;
      const t = typeof l.target === "string" ? l.target : (l.target as any).id;
      if (s) connected.add(s);
      if (t) connected.add(t);
    }

    // Add virtual links from isolated nodes to hub
    const virtualLinks: any[] = [];
    for (const n of nodes) {
      if (!connected.has(n.id) && n.id !== hubId) {
        virtualLinks.push({ source: n.id, target: hubId, __virtual: true });
      }
      // Also link isolated nodes of same category to each other
    }

    // Also cluster same-category nodes together with weak links
    const byCategory: Record<string, string[]> = {};
    for (const n of nodes) {
      if (!byCategory[n.category]) byCategory[n.category] = [];
      byCategory[n.category].push(n.id);
    }
    for (const catNodes of Object.values(byCategory)) {
      if (catNodes.length < 2) continue;
      for (let i = 1; i < catNodes.length; i++) {
        // Check if this pair already has a real link
        const a = catNodes[i - 1], b = catNodes[i];
        const hasLink = links.some(l => {
          const s = typeof l.source === "string" ? l.source : (l.source as any).id;
          const t = typeof l.target === "string" ? l.target : (l.target as any).id;
          return (s === a && t === b) || (s === b && t === a);
        });
        if (!hasLink) {
          virtualLinks.push({ source: a, target: b, __virtual: true });
        }
      }
    }

    return {
      nodes: nodes.map((n) => ({ ...n })),
      links: [
        ...links.map((l) => ({ source: l.source, target: l.target })),
        ...virtualLinks,
      ],
    };
  }, [nodes, links, connectionCounts]);

  // Configure forces
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    fg.d3Force("link")?.distance((link: any) => link.__virtual ? 25 : 40);
    fg.d3Force("charge")?.strength(-30);
    fg.d3Force("center")?.strength(1.0);

    // Zoom to fit
    setTimeout(() => fg.zoomToFit(300, 50), 3500);
  }, [nodes]);

  const nodeThreeObject = useCallback(
    (node: any) => {
      const color = CATEGORY_COLORS[node.category] || "#64748b";
      const count = connectionCounts[node.id] || 0;
      const size = 3 + Math.min(count * 0.4, 4);
      const isActive = activeNode === node.id;

      const group = new THREE.Group();

      // Core sphere
      const geo = new THREE.SphereGeometry(size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(isActive ? "#ffffff" : color),
        emissive: new THREE.Color(color),
        emissiveIntensity: isActive ? 1.0 : 0.3,
        roughness: 0.3,
        metalness: 0.4,
      });
      group.add(new THREE.Mesh(geo, mat));

      // Glow halo
      const glowGeo = new THREE.SphereGeometry(size * 1.6, 14, 14);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: isActive ? 0.35 : 0.12,
      });
      group.add(new THREE.Mesh(glowGeo, glowMat));

      // Label - big readable text with dark background
      const label = shortTitle(node.title || "");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Set font FIRST for correct measurement
      const fontSize = 36;
      const font = `${isActive ? "bold " : ""}${fontSize}px Inter, Arial, sans-serif`;
      ctx.font = font;
      const measured = ctx.measureText(label);
      const textW = measured.width || label.length * fontSize * 0.5;

      canvas.width = Math.ceil(textW + 32);
      canvas.height = fontSize + 20;

      // Re-set font after resize (canvas resize clears context state)
      ctx.font = font;

      // Dark background pill
      ctx.fillStyle = isActive ? "rgba(255,255,255,0.18)" : "rgba(6,6,10,0.75)";
      const pw = canvas.width, ph = canvas.height, r = 8;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(pw - r, 0);
      ctx.quadraticCurveTo(pw, 0, pw, r);
      ctx.lineTo(pw, ph - r);
      ctx.quadraticCurveTo(pw, ph, pw - r, ph);
      ctx.lineTo(r, ph);
      ctx.quadraticCurveTo(0, ph, 0, ph - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = isActive ? "#ffffff" : "#d4dae4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: isActive ? 1 : 0.85,
          sizeAttenuation: true,
        })
      );
      const aspect = canvas.width / canvas.height;
      sprite.scale.set(aspect * 3, 3, 1);
      sprite.position.y = -(size + 3);
      group.add(sprite);

      return group;
    },
    [connectionCounts, activeNode]
  );

  const handleClick = useCallback(
    (node: any) => {
      onNodeClick(node.id);
      const dist = 40;
      fgRef.current?.cameraPosition(
        { x: node.x + dist, y: node.y + dist * 0.4, z: node.z + dist },
        node,
        800
      );
    },
    [onNodeClick]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-surface-500 text-sm">
        Nessuna pagina trovata
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={true}
        onNodeClick={handleClick}
        linkColor={(link: any) =>
          (link as any).__virtual ? "rgba(80,80,80,0.0)" : "rgba(120,140,170,0.35)"
        }
        linkWidth={(link: any) => ((link as any).__virtual ? 0 : 1)}
        linkDirectionalArrowLength={(link: any) =>
          (link as any).__virtual ? 0 : 4
        }
        linkDirectionalArrowRelPos={0.92}
        linkDirectionalArrowColor="rgba(120,140,170,0.5)"
        linkOpacity={0.3}
        backgroundColor="#08080c"
        enableNodeDrag={true}
        cooldownTicks={300}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.3}
        showNavInfo={false}
      />
      <div className="absolute bottom-3 left-3 text-[10px] text-surface-600 pointer-events-none select-none">
        Trascina per ruotare · Scroll per zoom · Click su un nodo per aprirlo
      </div>
    </div>
  );
}
