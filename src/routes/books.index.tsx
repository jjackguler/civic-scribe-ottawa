import { createFileRoute, redirect } from "@tanstack/react-router";

/** /books: the editor's books are listed on the editor's page. */
export const Route = createFileRoute("/books/")({
  beforeLoad: () => {
    throw redirect({ to: "/editor", hash: "books", statusCode: 301 });
  },
});
