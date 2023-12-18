import Link from 'next/link';

export default function Home() {
  return (
    <section className="h-full w-full">
      <h1 className="text-4xl font-extrabold md:text-7xl max-w-[36rem] md:max-w-[43rem]">
        Ricardo&apos;s Coding Explorations
      </h1>

      <Link href="/demos/simple-cube">Go to demos</Link>
    </section>
  );
}
