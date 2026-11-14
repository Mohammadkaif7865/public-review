const apiBaseUrl = "/api/v1";

export type HealthResponse = {
  status: "ok";
  service: string;
  runtime: "nextjs";
  environment: string;
  timestamp: string;
};

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`API health check failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

