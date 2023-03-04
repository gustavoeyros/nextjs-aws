import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import "../../../configureAmplify";
import { listPosts, getPost } from "@/graphql/queries";
import { GetPostQuery, ListPostsQuery } from "@/API";
import { useEffect, useState } from "react";
import { createComment } from "@/graphql/mutations";
import dynamic from "next/dynamic";
import { v4 as uuid } from "uuid";
import { Auth, Hub } from "aws-amplify";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
const initialState = {
  id: "",
  message: "",
};

const Post = ({ post }: any) => {
  const [signedInUser, setSignedInUser] = useState(false);
  const [coverImage, setCoverImage] = useState(String);
  const [comment, setComment] = useState<any>(initialState);
  const [showMe, setShowMe] = useState(false);
  const router = useRouter();
  const { message } = comment;

  const toggle = () => {
    setShowMe(!showMe);
  };

  useEffect(() => {
    authListener();
  });
  async function authListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
          return setSignedInUser(true);
        case "signOut":
          return setSignedInUser(false);
      }
    });
    try {
      await Auth.currentAuthenticatedUser();
      setSignedInUser(true);
    } catch (errpr) {}
  }

  useEffect(() => {
    updateCoverImage();
  }, []);

  const updateCoverImage = async () => {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      setCoverImage(imageKey);
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const createTheComment = async () => {
    if (!message) return;
    const id = uuid();
    comment.id = id;
    try {
      await API.graphql({
        query: createComment,
        variables: { input: comment },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } catch (error) {
      console.log(error);
    }
    router.push("/my-posts");
  };

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      {coverImage && <img src={coverImage} className="mt4" />}

      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div>
        {signedInUser && (
          <button
            type="button"
            className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
            onClick={toggle}
          >
            Write a Comment
          </button>
        )}

        {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMDE
              value={comment.message}
              onChange={(value) =>
                setComment({ ...comment, message: value, postID: post.id })
              }
            />
            <button
              type="button"
              className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
              onClick={createTheComment}
            >
              Save
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export async function getStaticPaths() {
  const postData = (await API.graphql({
    query: listPosts,
  })) as { data: ListPostsQuery };

  const paths = postData.data.listPosts?.items.map((post) => ({
    params: { id: post?.id },
  }));
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }: any) {
  const { id } = params;
  const postData = (await API.graphql({
    query: getPost,
    variables: { id },
  })) as { data: GetPostQuery };
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 1,
  };
}

export default Post;
