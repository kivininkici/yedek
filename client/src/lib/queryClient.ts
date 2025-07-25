import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
<<<<<<< HEAD
    const res = await fetch(queryKey[0] as string, {
=======
    const res = await fetch(queryKey.join("/") as string, {
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
<<<<<<< HEAD
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // 10 dakika cache - daha hızlı
      gcTime: 30 * 60 * 1000, // 30 dakika
      retry: false,
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
=======
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
    },
  },
});
