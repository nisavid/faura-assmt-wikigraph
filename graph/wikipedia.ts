/**
 * Fetches the list of internal Wikipedia links for a given article.
 *
 * @param topic - The Wikipedia article title.
 * @returns A promise that resolves to an array of linked article titles.
 * @throws An error if the Wikipedia API call fails.
 */
export async function fetchWikipediaLinks(topic: string): Promise<string[]> {
  // Build the API endpoint URL with proper URL encoding.
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    topic
  )}&prop=links&plnamespace=0&pllimit=500&format=json`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.statusText}`);
  }
  const data = await response.json() as {
    query?: { pages?: Record<string, { links?: { title: string }[] }> }
  };

  // Extract page data from the response.
  const pages = data.query?.pages;
  if (!pages) {
    return [];
  }
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  // Extract and return the titles of the links; return an empty array if none exist.
  const links = page.links || [];
  return links.map((link: { title: string }) => link.title);
}
