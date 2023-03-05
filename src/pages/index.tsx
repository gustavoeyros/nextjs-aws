import { useState, useEffect } from "react";
import { API, graphqlOperation, Storage } from "aws-amplify";
import { listPosts } from "../graphql/queries";
import { ListPostsQuery } from "@/API";
import Link from "next/link";
import { newOnCreatePost } from "@/graphql/subscriptions";
import { NewOnCreatePostSubscription } from "@/API";
import { GraphQLSubscription } from "@aws-amplify/api";

export default function Home() {
  const [posts, setPosts] = useState<any>([]);

  let subOnCreate: any;

  const setUpSubscriptions = () => {
    subOnCreate = API.graphql<GraphQLSubscription<NewOnCreatePostSubscription>>(
      graphqlOperation(newOnCreatePost)
    ).subscribe({
      next: (postData: any) => {
        console.log(postData.value);
        setPosts(postData);
      },
    });
  };

  useEffect(() => {
    setUpSubscriptions();
    return () => {
      subOnCreate.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [posts]);

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
        Posts
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
            <div className="cursor-pointer mt-2 ">
              <h2 className="text-xl font-semibold" key={index}>
                {posts.title}
              </h2>
              <p className="text-gray-500 mt-2">Author: {posts.username}</p>
              {posts.comments.items.length > 0 &&
                posts.comments.items.map((comment: any, index: number) => (
                  <div
                    key={index}
                    className="py-8 px-8 max-w-xl  bg-white shadow-lg space-y-2 sm:py-1 sm:flex my-6 mx-12 sm:items-center sm:space-y-0 sm:space-x-6 mb-2 rounded-lg"
                  >
                    <div>
                      <p className="text-gray-500 mt-2">{comment.message}</p>
                      <p className="text-gray-200 mt-1">{comment.createdBy}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
