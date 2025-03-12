/**
 * Represents a single Wikipedia article node in the graph.
 */
export interface GraphNode {
  id: string;         // Unique identifier, e.g., "Albert_Einstein"
  title: string;      // Human-readable title, e.g., "Albert Einstein"
  links: string[];    // List of article titles linked from this node
}

/**
 * Represents the complete link graph for a given query topic.
 */
export interface LinkGraph {
  root: string;             // The original query topic
  nodes: GraphNode[];       // All nodes discovered during traversal
}
