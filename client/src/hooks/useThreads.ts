import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type { Thread, InsertThread, Comment, InsertComment } from "@shared/schema";

export function useThreads() {
  const queryClient = useQueryClient();
  const threadsQuery = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createThread = useMutation({
    mutationFn: async (data: InsertThread & { userId?: string }) => {
      const res = await apiRequest("POST", "/api/threads", data);
      return (await res.json()) as Thread;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/threads"] }),
  });

  return { ...threadsQuery, createThread };
}

export function useThread(threadId: string) {
  return useQuery<Thread>({
    queryKey: ["/api/threads", threadId],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useComments(threadId: string) {
  const queryClient = useQueryClient();
  const commentsQuery = useQuery<Comment[]>({
    queryKey: ["/api/threads", threadId, "comments"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const addComment = useMutation({
    mutationFn: async (data: InsertComment & { userId?: string }) => {
      const res = await apiRequest(
        "POST",
        `/api/threads/${threadId}/comments`,
        data,
      );
      return (await res.json()) as Comment;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/threads", threadId, "comments"],
      }),
  });

  return { ...commentsQuery, addComment };
}
