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

    let fetchedContext = "";

    // Try fetching llms.txt first (standard for AI context)
    try {
      const llmsRes = await fetch(`${baseUrl}/${branch}/llms.txt`);
      if (llmsRes.ok) {
        const text = await llmsRes.text();
        fetchedContext = text.substring(0, 15000); // Limit context size
      }
    } catch (e) {
      console.warn("llms.txt fetch failed", e);
    }

    // Fallback to README.md if llms.txt failed
    if (!fetchedContext) {
      try {
        const readmeRes = await fetch(`${baseUrl}/${branch}/README.md`);
        if (readmeRes.ok) {
          const text = await readmeRes.text();
          fetchedContext = text.substring(0, 15000);
        }
      } catch (e) {
        console.warn("README.md fetch failed", e);
      }
    }

    if (!fetchedContext) {
      throw new Error("Could not access repository content. If this is a private repository, please use the 'Manual Input' tab to paste your documentation.");
    }

    return { name: repoName, context: fetchedContext };

  } catch (error: any) {
    if (error.message.includes("Manual Input")) {
      throw error;
    }
    throw new Error("Could not parse repository. Please check the URL or try pasting the context manually.");
  }
};