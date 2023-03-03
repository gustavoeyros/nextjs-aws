import { useState, useEffect } from "react";
import { API, Storage } from "aws-amplify";
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

    const { items }: any = postData.data.listPosts;
    const postWithImages = await Promise.all(
      items.map(async (post: any) => {
        if (post.coverImage) {
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    );
    setPosts(postWithImages);
  };

  return (
    <div>
      <h1 className="text-sky-400 text-3xl font-bold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((posts: any, index: any) => (
        <Link key={index} href={`/posts/${posts.id}`}>
          <div className="my-6 pb-6 border-b border-gray-300">
            {posts.coverImage && (
              <img
                src={posts.coverImage}
                className="w-36 h-36 bg-contain bg-center rounded-full sm:x-0 sm:shrink-0"
              />
            )}
            <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
              <h2 className="text-xl font-semibold" key={index}>
                {posts.title}
              </h2>
              <p className="text-gray-500 mt-2">Author: {posts.username}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
