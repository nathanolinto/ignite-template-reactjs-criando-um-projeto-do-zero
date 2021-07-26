import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle } from 'react-icons/ai';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from "next/router";
import { RichText } from 'prismic-dom';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {

  const router = useRouter();

  if(router.isFallback) {
    return (<div>Carregando...</div>);
  }

  function countTime(content: { heading: string, body: {text:string}[] }[]) {
    let count = 0;
    content.map(cont => {
      count += cont.heading.split(" ").length;
      const countBody = cont.body.reduce( function(acc, text) {
        return text.text.split(" ").length + acc;
      }, 0);
      count += countBody;
    })

    return Math.ceil(count/200);
  }


  return (
    <div className={styles.postContainer}>
      <img src={props.post.data.banner.url} alt={props.post.data.title} />
      <main className={styles.postContent}>
        <h2>{props.post.data.title}</h2>
        <div className={commonStyles.postInfo} >
          <div>
            <AiOutlineCalendar /> {format(new Date(props.post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}
          </div>
          <div>
            <AiOutlineUser /> {props.post.data.author}
          </div>
          <div>
            <AiOutlineClockCircle /> {countTime(props.post.data.content)} min
          </div>
        </div>

        <div className="body">
          {props.post.data.content.map(content => (
            <div key={content.heading}>
              <h3 >{content.heading}</h3>

              <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
              {/* {content.body.map(body => (
                <p>{body.text}</p>
              ))} */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ["post.uid"]
  });

  const paths = response.results.map(post => { return ({ params: { slug: post.uid } }) });

  return {
    paths,
    fallback: "blocking"
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }


  return {
    props: { post }
  }

};
