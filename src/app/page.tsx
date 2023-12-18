import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  return (
    <section className="h-full w-full flex flex-col">
      <header className="w-full h-16 bg-white/70 backdrop-blur-md">
        <div className="flex justify-between items-center h-full max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex h-full shrink-0 items-center gap-x-3 group"
          >
            <RocketLaunchIcon className="h-8 w-auto text-indigo-600 group-hover:text-indigo-500 transition-colors" />

            <span className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-indigo-500 transition-colors">
              Coding Explorations
            </span>
          </Link>

          <nav className="flex gap-x-3">
            <button className="font-medium text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50/50 py-2 px-2 rounded-md">
              About
            </button>

            <button className="font-medium text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50/50 py-2 px-2 rounded-md">
              See demos
            </button>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto pt-24 flex flex-col items-start">
        <h1 className="text-4xl font-extrabold md:text-7xl max-w-[36rem] md:max-w-[43rem]">
          Ricardo&apos;s Coding Explorations
        </h1>

        <Link
          href="/demos/simple-cube"
          className="px-6 py-3 rounded-full bg-white text-indigo-500 flex justify-center items-center shadow-md shadow-black/5 hover:shadow-black/10 transition-shadow"
        >
          Go to demos
        </Link>
      </section>
    </section>
  );
}
