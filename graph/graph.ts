import { api, APIError } from "encore.dev/api";
import { LinkGraph, GraphNode } from "../types";
import { fetchWikipediaLinks } from "./wikipedia";
import { MinLen, MaxLen, Min, Max } from "encore.dev/validate";

interface GraphParams {
  // The query topic, between 1 and 50 characters.
  topic: string & MinLen<1> & MaxLen<50>;
  // The recursion depth, a number between 0 and 5; defaults to 0.
  depth?: number & Min<0> & Max<5>;
}

/**
 * Recursively builds a graph of Wikipedia links starting from a given topic.
 *
 * @param topic - The current article title.
 * @param currentDepth - The current recursion level (0 for the root).
 * @param maxDepth - The maximum depth for traversal.
 * @param visited - A set of topics already processed (to avoid cycles).
 * @returns A map from article title to its corresponding GraphNode.
 * @throws A structured API error if fetching links fails.
 */
async function buildGraph(
  topic: string,
  currentDepth: number,
  maxDepth: number,
  visited: Set<string>
): Promise<Map<string, GraphNode>> {
  if (visited.has(topic)) return new Map();
  visited.add(topic);

  let links: string[];
  try {
    links = await fetchWikipediaLinks(topic);
  } catch (error: any) {
    throw APIError.internal(`Failed to fetch links for ${topic}: ${error.message}`, error);
  }

  const node: GraphNode = {
    id: topic,
    title: topic.replace(/_/g, " "),
    links: links,
  };

  const graphNodes = new Map<string, GraphNode>();
  graphNodes.set(topic, node);

  // If the current depth is less than the maximum, process child topics.
  if (currentDepth < maxDepth) {
    const childrenPromises = links.map((link) =>
      buildGraph(link.replace(/ /g, "_"), currentDepth + 1, maxDepth, visited)
    );
    const childrenResults = await Promise.all(childrenPromises);
    for (const childMap of childrenResults) {
      for (const [childTopic, childNode] of childMap.entries()) {
        if (!graphNodes.has(childTopic)) {
          graphNodes.set(childTopic, childNode);
        }
      }
    }
  }
  return graphNodes;
}

export const getGraph = api(
  { expose: true, method: "GET", path: "/graph/:topic" },
  async ({ topic, depth }: GraphParams): Promise<LinkGraph> => {
    const maxDepth = depth ?? 0;
    const visited = new Set<string>();
    try {
      const nodesMap = await buildGraph(topic, 0, maxDepth, visited);
      const nodes = Array.from(nodesMap.values());
      return { root: topic, nodes };
    } catch (error: any) {
      throw APIError.internal(`Error building graph: ${error.message}`, error);
    }
  }
);
