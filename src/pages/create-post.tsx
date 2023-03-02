import { useState, useRef } from "react";
import { API } from "aws-amplify";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { createPost } from "@/graphql/mutations";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = {
  id: "",
  title: "",
  content: "",
};

const CreatePost = () => {
  const [post, setPost] = useState(initialState);
  const { title, content } = post;
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }

  async function createNewPost() {
    if (!title || !content) return;
    const id = uuid();
    post.id = id;
    await API.graphql({
      query: createPost,
      variables: {
        input: post,
      },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">
        Create a new Post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMdeReact
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <button
        type="button"
        className="bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        onClick={createNewPost}
      >
        Create Post
      </button>
    </div>
  );
};

export default withAuthenticator(CreatePost);
