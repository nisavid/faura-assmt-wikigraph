import { describe, expect, test, vi, afterEach } from "vitest";
import { getGraph } from "./graph";
import * as wikipediaModule from "./wikipedia";

/**
 * Overrides the fetchWikipediaLinks function to return controlled data.
 *
 * @param mapping - A record mapping topic titles to arrays of linked topics.
 */
function setMapping(mapping: Record<string, string[]>) {
  vi.spyOn(wikipediaModule, "fetchWikipediaLinks").mockImplementation(async (topic: string) => {
    return mapping[topic] || [];
  });
}

describe("Graph API endpoint /graph/:topic", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Depth 0 cases", () => {
    test("root with no links returns only the root node", async () => {
      setMapping({ "Root": [] });
      const graph = await getGraph({ topic: "Root", depth: 0 });
      expect(graph.root).toBe("Root");
      expect(graph.nodes.map(n => n.id)).toEqual(["Root"]);
      const rootNode = graph.nodes.find(n => n.id === "Root");
      expect(rootNode?.links).toEqual([]);
    });

    test("root with one link returns only the root node with correct links", async () => {
      setMapping({ "Root": ["Child"] });
      const graph = await getGraph({ topic: "Root", depth: 0 });
      expect(graph.root).toBe("Root");
      expect(graph.nodes.map(n => n.id)).toEqual(["Root"]);
      const rootNode = graph.nodes.find(n => n.id === "Root");
      expect(rootNode?.links).toEqual(["Child"]);
    });

    test("root with multiple links returns only the root node with correct links", async () => {
      setMapping({ "Root": ["Child1", "Child2"] });
      const graph = await getGraph({ topic: "Root", depth: 0 });
      expect(graph.root).toBe("Root");
      expect(graph.nodes.map(n => n.id)).toEqual(["Root"]);
      const rootNode = graph.nodes.find(n => n.id === "Root");
      expect(rootNode?.links).toEqual(["Child1", "Child2"]);
    });
  });

  describe("Depth 1 cases", () => {
    test("root with one child that has no links returns root and child with an empty child links array", async () => {
      const mapping = { "Root": ["Child"], "Child": [] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "Root", depth: 1 });
      expect(graph.nodes.map(n => n.id).sort()).toEqual(["Root", "Child"].sort());
      const rootNode = graph.nodes.find(n => n.id === "Root");
      expect(rootNode?.links).toEqual(["Child"]);
      const childNode = graph.nodes.find(n => n.id === "Child");
      expect(childNode?.links).toEqual([]);
    });

    test("root with one child that has links returns root and child; child's links are reported but not expanded", async () => {
      const mapping = { "Root": ["Child"], "Child": ["Grandchild1", "Grandchild2"] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "Root", depth: 1 });
      expect(graph.nodes.map(n => n.id).sort()).toEqual(["Root", "Child"].sort());
      const childNode = graph.nodes.find(n => n.id === "Child");
      expect(childNode?.links).toEqual(["Grandchild1", "Grandchild2"]);
      expect(graph.nodes.find(n => n.id === "Grandchild1")).toBeUndefined();
      expect(graph.nodes.find(n => n.id === "Grandchild2")).toBeUndefined();
    });
  });

  describe("Depth 2 and duplicate node tests", () => {
    test("when the same topic is linked at multiple depths, it appears only once", async () => {
      // Mapping: A -> [B, C], B -> [C], C -> [D], D -> []
      const mapping = { "A": ["B", "C"], "B": ["C"], "C": ["D"], "D": [] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "A", depth: 2 });
      // Expected nodes: A, B, C, D (D is at depth 2)
      expect(graph.nodes.map(n => n.id).sort()).toEqual(["A", "B", "C", "D"].sort());
      const nodeB = graph.nodes.find(n => n.id === "B");
      expect(nodeB?.links).toEqual(["C"]);
      const nodeC = graph.nodes.find(n => n.id === "C");
      expect(nodeC?.links).toEqual(["D"]);
      const nodeD = graph.nodes.find(n => n.id === "D");
      expect(nodeD?.links).toEqual([]);
    });
  });

  describe("Cycle tests", () => {
    test("self-loop at depth 1 (a page linking to itself)", async () => {
      const mapping = { "A": ["A"] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "A", depth: 1 });
      expect(graph.nodes.map(n => n.id)).toEqual(["A"]);
      const nodeA = graph.nodes.find(n => n.id === "A");
      expect(nodeA?.links).toEqual(["A"]);
    });

    test("two-page cycle at depth 2 (A → B, B → A)", async () => {
      const mapping = { "A": ["B"], "B": ["A"] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "A", depth: 2 });
      expect(graph.nodes.map(n => n.id).sort()).toEqual(["A", "B"].sort());
      const nodeA = graph.nodes.find(n => n.id === "A");
      expect(nodeA?.links).toEqual(["B"]);
      const nodeB = graph.nodes.find(n => n.id === "B");
      expect(nodeB?.links).toEqual(["A"]);
    });

    test("three-page cycle at depth 3 (A → B, B → C, C → A)", async () => {
      const mapping = { "A": ["B"], "B": ["C"], "C": ["A"] };
      setMapping(mapping);
      const graph = await getGraph({ topic: "A", depth: 3 });
      expect(graph.nodes.map(n => n.id).sort()).toEqual(["A", "B", "C"].sort());
      const nodeC = graph.nodes.find(n => n.id === "C");
      expect(nodeC?.links).toEqual(["A"]);
    });
  });
});
