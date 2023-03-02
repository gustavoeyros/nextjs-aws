import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { listPosts } from "../graphql/queries";
import { ListPostsQuery } from "@/API";
import Link from "next/link";

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
      <h1 className="text-sky-400 text-3xl font-bold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((posts: any, index: any) => (
        <Link key={index} href={`/posts/${posts.id}`}>
          <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
            <h2 className="text-xl font-semibold" key={index}>
              {posts.content}
            </h2>
            <p className="text-gray-500 mt-2">Author: {posts.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
