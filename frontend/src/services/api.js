/**
 * Frontend API Service
 * Handles the SSE streaming connection to the backend.
 */

const API_BASE = "/api";

/**
 * Analyze a GitHub repository via streaming SSE.
 *
 * @param {string} url - The GitHub repository URL
 * @param {object} callbacks
 *   - onMetadata(metadata): Called when repo metadata arrives
 *   - onChunk(text): Called for each AI text chunk
 *   - onComplete(): Called when stream finishes
 *   - onError(errorMessage, errorType): Called on errors
 */
export async function analyzeRepo(url, { onMetadata, onChunk, onComplete, onError, signal }) {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal
    });

    // Handle non-SSE error responses (JSON)
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        onError(
          errorData.error || `Server error: ${response.status}`,
          errorData.errorType || "UNKNOWN"
        );
      } else {
        onError(`Server error: ${response.status} ${response.statusText}`, "UNKNOWN");
      }
      return;
    }

    // Read the SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    
    let finalMetadata = null;
    let finalContent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by \n\n)
      const events = buffer.split("\n\n");
      // Keep the last incomplete event in the buffer
      buffer = events.pop() || "";

      for (const event of events) {
        const trimmed = event.trim();

        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6); // Remove "data: " prefix

        // Check for stream end signal
        if (data === "[DONE]") {
          onComplete(finalMetadata, finalContent);
          return;
        }

        try {
          const parsed = JSON.parse(data);

          if (parsed.type === "metadata") {
            finalMetadata = parsed.data;
            onMetadata(parsed.data, parsed.languages, parsed.techStack, parsed.dependencies, parsed.security, parsed.tree);
          } else if (parsed.type === "error") {
            onError(parsed.error, parsed.errorType || "UNKNOWN");
            return;
          } else if (parsed.content) {
            finalContent += parsed.content;
            onChunk(parsed.content);
          }
        } catch {
          // Non-JSON data line, skip
        }
      }
    }

    // Stream ended without [DONE] signal
    onComplete(finalMetadata, finalContent);
  } catch (err) {
    if (err.name === "AbortError") {
      onError("Analysis cancelled.", "ABORTED");
      return;
    }
    onError(
      err.message === "Failed to fetch"
        ? "Cannot connect to server. Make sure the backend is running."
        : err.message,
      "UNKNOWN"
    );
  }
}
