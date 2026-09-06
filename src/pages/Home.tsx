import { useMemo } from "react";
import { LayoutRenderer } from "../components/layout/LayoutRenderer";
import { LayoutSpec, LayoutNode } from "../lib/design/LayoutSpec";
import { useApp } from "../context/AppContext";

const DEFAULT_HOME_LAYOUT: LayoutSpec = {
  version: 1,
  surface: "home",
  root: {
    type: "stack",
    direction: "col",
    gap: "lg",
    children: [
      { type: "widget", widgetId: "header" },
      { type: "widget", widgetId: "upcoming_tasks" },
      {
        type: "grid",
        columns: 2, // Renderer maps this to a 2-column grid
        gap: "lg",
        children: [
          {
            type: "stack",
            direction: "col",
            gap: "md",
            children: [
              { type: "widget", widgetId: "weekly_chart" },
              { type: "widget", widgetId: "stats_row" }
            ]
          },
          {
            type: "stack",
            direction: "col",
            gap: "md",
            children: [
              { type: "widget", widgetId: "focus" },
              { type: "widget", widgetId: "recent_notes" },
              { type: "widget", widgetId: "category_breakdown" }
            ]
          }
        ]
      }
    ]
  }
};

const hasWidget = (node: LayoutNode, widgetId: string): boolean => {
  if (node.type === "widget") return node.widgetId === widgetId;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.some(child => hasWidget(child, widgetId));
  }
  return false;
};

export default function Home() {
  const { layouts } = useApp();
  
  const currentLayout = useMemo(() => {
    const customLayout = layouts.find(l => l.surface === "home");
    let layout = DEFAULT_HOME_LAYOUT;
    
    if (customLayout && customLayout.layout_spec && customLayout.layout_spec.root) {
      layout = customLayout.layout_spec;
    }
    
    // Compatibility: If layout doesn't have the focus widget, gracefully inject it.
    // We only do this if it's completely missing, ensuring we don't break user intent if they moved it.
    if (!hasWidget(layout.root, "focus")) {
      const newLayout = JSON.parse(JSON.stringify(layout));
      let injected = false;
      
      // Attempt to inject at the top of the right column if it's a standard grid
      if (newLayout.root.type === "stack" && Array.isArray(newLayout.root.children)) {
        const grid = newLayout.root.children.find((c: any) => c.type === "grid");
        if (grid && Array.isArray(grid.children) && grid.children.length > 1) {
          const rightCol = grid.children[1];
          if (rightCol.type === "stack" && Array.isArray(rightCol.children)) {
            rightCol.children.unshift({ type: "widget", widgetId: "focus" });
            injected = true;
          }
        }
        
        // Fallback: just put it below upcoming tasks
        if (!injected && newLayout.root.children.length > 1) {
          newLayout.root.children.splice(2, 0, { type: "widget", widgetId: "focus" });
        } else if (!injected) {
          newLayout.root.children.push({ type: "widget", widgetId: "focus" });
        }
      }
      return newLayout;
    }

    return layout;
  }, [layouts]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden w-full">
      <div className="px-4 md:px-8 py-6 md:py-8 w-full max-w-5xl mx-auto">
        <LayoutRenderer spec={currentLayout} />
      </div>
    </div>
  );
}
