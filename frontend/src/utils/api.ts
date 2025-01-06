type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, headers = {} } = options;

  // Get token from localStorage
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token.trim()}` }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  // For DELETE requests, return just the response status
  if (method === "DELETE") {
    return { success: true };
  }
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}
