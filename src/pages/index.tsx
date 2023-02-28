import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { listPosts } from "../graphql/queries";
import { ListPostsQuery } from "@/API";

export default function Home() {
  const [posts, setPosts] = useState<any>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const postData = (await API.graphql({
      query: listPosts,
    })) as { data: ListPostsQuery; errors: Error[] };

    setPosts(postData.data.listPosts?.items);
  };

  return (
    <div>
      <h1 className="text-sky-400 text-6xl font-bold underline">My Posts!</h1>
      {posts.map((posts: any, index: any) => (
        <p key={index}>{posts.content}</p>
      ))}
    </div>
  );
}
