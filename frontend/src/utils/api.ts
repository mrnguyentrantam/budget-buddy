type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, headers = {} } = options;

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

  if (method === "DELETE") {
    return { success: true };
  }

  const data = await response.json();

  if (response.status === 401) {
    // Clear token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/auth";
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}
