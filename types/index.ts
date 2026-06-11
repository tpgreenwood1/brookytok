export type MediaItem = {
  id: string;
  postId: string;
  url: string;
  objectKey: string;
  /** "image" | "video" */
  mediaType: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: Date;
};

export type PostWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    name: string;
    image: string | null;
  };
  media: MediaItem[];
  likeCount: number;
  dislikeCount: number;
  myReaction: "like" | "dislike" | null;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string | null;
  name: string;
  bio: string | null;
  image: string | null;
  createdAt: Date;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string;
  displayName: string | null;
  bio: string | null;
};

export type UserSearchResult = {
  id: string;
  username: string;
  displayName: string | null;
  name: string;
  image: string | null;
  bio: string | null;
  isFollowing: boolean;
  _count: { followers: number };
};
