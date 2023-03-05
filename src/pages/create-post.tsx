import { useState, useRef, ChangeEvent } from "react";
import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { createPost } from "@/graphql/mutations";
import { Authenticator } from "@aws-amplify/ui-react";
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import "@aws-amplify/ui-react/styles.css";

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = {
  id: "",
  title: "",
  content: "",
  coverImage: "",
};

const CreatePost = () => {
  const [post, setPost] = useState(initialState);
  const [image, setImage] = useState<File>();
  const { title, content } = post;
  const imageFileInput = useRef<any>(null);
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
    if (image) {
      const filename = `${image.name}_${uuid()}`;
      post.coverImage = filename;
      await Storage.put(filename, image);
    }
    await API.graphql({
      query: createPost,
      variables: {
        input: post,
      },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  }
  const uploadImage = async () => {
    imageFileInput?.current?.click();
  };
  const handleChange = (e: any) => {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;
    setImage(fileUploaded);
  };
  return (
    <Authenticator>
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
        {image && <img src={URL.createObjectURL(image)} className="my-4" />}
        <SimpleMdeReact
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
        />
        <input
          type="file"
          ref={imageFileInput}
          className="absolute w-0 h-0"
          onChange={handleChange}
        />
        <button
          type="button"
          className="bg-green-600 text-white font-semibold px-8 py-2 rounded-lg mr-2"
          onClick={uploadImage}
        >
          Upload Cover Image
        </button>
        <button
          type="button"
          className="bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
          onClick={createNewPost}
        >
          Create Post
        </button>{" "}
      </div>
    </Authenticator>
  );
};

export default CreatePost;
