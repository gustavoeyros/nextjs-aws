import { PostsByUsernameQuery } from "@/API";
import { postsByUsername } from "@/graphql/queries";
import { Auth, API } from "aws-amplify";
import { useState, useEffect } from "react";
import Link from "next/link";
const MyPosts = () => {
  const [posts, setPosts] = useState<any>([]);
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { attributes, username } = await Auth.currentAuthenticatedUser();
    const postData = (await API.graphql({
      query: postsByUsername,
      variables: { username: `${attributes.sub}::${username}` },
    })) as { data: PostsByUsernameQuery };

    setPosts(postData.data.postsByUsername?.items);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((post: any, index: any) => (
        <Link key={index} href={`/posts/${post.id}`}>
          <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-500">Author: {post.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MyPosts;
