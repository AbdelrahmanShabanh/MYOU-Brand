declare module 'next' {
  export interface PageProps {
    params: { category: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
} 