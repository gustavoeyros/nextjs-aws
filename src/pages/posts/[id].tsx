import { API } from "aws-amplify";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import "../../../configureAmplify";
import { listPosts, getPost } from "@/graphql/queries";
import { GetPostQuery, ListPostsQuery } from "@/API";

const Post = ({ post }: any) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        <ReactMarkdown>{post.content}</ReactMarkdown>
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
