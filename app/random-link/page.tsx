export default async function RandomLink() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-bold">Random Link</h1>
      <p className="text-xl">
        This page is a demo of the{" "}
        <a
          className="text-primary underline"
          href="https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tailwind CSS example
        </a>
        .
      </p>
    </div>
  );
}
