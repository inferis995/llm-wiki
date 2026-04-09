import { getAllPages, getGraphData, getPagesByCategory } from "@/lib/wiki";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  const pages = getAllPages();
  const { nodes, links } = getGraphData(pages);
  const grouped = getPagesByCategory(pages);

  return (
    <HomeClient
      pages={pages}
      nodes={nodes}
      links={links}
      grouped={grouped}
      categoryColors={CATEGORY_COLORS}
      categoryLabels={CATEGORY_LABELS}
    />
  );
}
