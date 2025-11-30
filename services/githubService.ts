/**
 * Attempts to fetch context from a GitHub URL.
 * It tries to construct raw URLs for llms.txt or README.md.
 */
export const fetchRepoContext = async (repoUrl: string): Promise<{ name: string; context: string }> => {
  try {
    // Basic parsing of github.com/user/repo
    const urlParts = repoUrl.replace(/\/$/, '').split('/');
    const repoIndex = urlParts.indexOf('github.com');
    
    if (repoIndex === -1 || urlParts.length < repoIndex + 3) {
      throw new Error("Invalid GitHub URL");
    }

    const user = urlParts[repoIndex + 1];
    const repo = urlParts[repoIndex + 2];
    const repoName = `${user}/${repo}`;
    const baseUrl = `https://raw.githubusercontent.com/${user}/${repo}`;
    const branch = 'main'; // simplifying assumption, could try 'master' as fallback

    // Try fetching llms.txt first (standard for AI context)
    try {
      const llmsRes = await fetch(`${baseUrl}/${branch}/llms.txt`);
      if (llmsRes.ok) {
        const text = await llmsRes.text();
        return { name: repoName, context: text.substring(0, 15000) }; // Limit context size
      }
    } catch (e) {
      console.warn("llms.txt fetch failed", e);
    }

    // Fallback to README.md
    try {
      const readmeRes = await fetch(`${baseUrl}/${branch}/README.md`);
      if (readmeRes.ok) {
        const text = await readmeRes.text();
        return { name: repoName, context: text.substring(0, 15000) };
      }
    } catch (e) {
      console.warn("README.md fetch failed", e);
    }

    // Fallback if nothing is fetched (e.g. CORS or Private)
    // We return just the name so Gemini can "hallucinate" a plausible architecture
    return { 
      name: repoName, 
      context: `The user provided the repository ${repoName} but the contents could not be fetched directly. 
      Please assume a standard architecture based on the repository name and common patterns for this type of tool.` 
    };

  } catch (error) {
    return {
      name: "Unknown Repo",
      context: "Could not parse repository. Please generate a generic software architecture diagram."
    };
  }
};