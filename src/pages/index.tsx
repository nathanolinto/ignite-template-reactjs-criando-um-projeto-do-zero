import { GetStaticProps } from 'next';
import Link from "next/link";
import Prismic from "@prismicio/client";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [next_page, SetNext_page] = useState(postsPagination.next_page);

  function handleLoadMorePosts(url:string) {
    fetch(url).then(response => {
      return response.json();
    }).then(data => {
  
      SetNext_page(data.next_page);

      const tempPosts = data.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      });
      
      const updatedPosts = posts.concat(tempPosts);
      setPosts(updatedPosts);
    });
  }

  return (
    <>
      <main className={styles.postContainer}>
        <div className={styles.postContent}>
          {posts.map(post => (
            <section key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.postInfo}>
                    <div>
                      <AiOutlineCalendar /> {format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                    <div>
                      <AiOutlineUser /> {post.data.author}
                    </div>
                  </div>
                </a>
              </Link>
            </section>
          ))}

          {next_page ? <button onClick={() => handleLoadMorePosts(next_page)}>Carregar mais posts</button> : <></>}
          
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1
  });

  const next_page = postsResponse.next_page;
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = { next_page, results: posts }

  return {
    props: {
      postsPagination
    }
  }

};
