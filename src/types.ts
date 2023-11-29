export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
}

export interface Post {
  id: number;
  content: string;
  user_id: number;
  created_at: Date;
}

export interface UserWithPosts extends User {
  posts: Post[];
}
