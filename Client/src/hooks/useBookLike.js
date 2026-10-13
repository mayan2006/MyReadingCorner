import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookLikeState, toggleBookLike } from "../services/bookLikeApi";
import { queryKeys } from "../queryKeys";
import { useAuth } from "../context/AuthContext.jsx";

export function useBookLike(bookCode) {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const currentUserCode = currentUser?.userCode || "";

  const likeQuery = useQuery({
    queryKey: queryKeys.bookLike(bookCode),
    queryFn: async () => {
      const res = await getBookLikeState(bookCode);
      if (!res || typeof res.count !== "number") {
        throw new Error("Failed to load likes");
      }
      return res;
    },
    enabled: Boolean(bookCode)
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await toggleBookLike(bookCode);
      if (!res || typeof res.count !== "number" || typeof res.liked !== "boolean") {
        throw new Error(res?.message || "Failed to toggle like");
      }
      return res;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bookLike(bookCode), {
        bookCode,
        count: data.count,
        likedByUser: data.liked
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.myLikedBooks });
    }
  });

  const toggleLike = () => {
    if (!currentUserCode || !bookCode || likeMutation.isPending) return;
    likeMutation.mutate();
  };

  return {
    likeCount: likeQuery.data?.count ?? 0,
    likedByMe: Boolean(likeQuery.data?.likedByUser),
    toggleLike,
    isToggling: likeMutation.isPending,
    currentUserCode
  };
}
