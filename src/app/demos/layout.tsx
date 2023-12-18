'use client';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { GithubIcon } from '@/components/GithubIcon';
import Link from 'next/link';

const navigation = [
  { name: 'Simple cube', href: '/simple-cube', icon: CubeIcon },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon },
];
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H' },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T' },
  { id: 3, name: 'Workcation', href: '#', initial: 'W' },
];

const ProjectHandle = ({ className }: { className?: string }) => (
  <Link href="/" className="flex h-16 shrink-0 items-center gap-x-3 group">
    <RocketLaunchIcon className="h-8 w-auto text-indigo-600 group-hover:text-indigo-500 transition-colors" />

    <span className="text-sm font-semibold leading-6 text-gray-900 group-hover:text-indigo-500 transition-colors">
      Coding Explorations
    </span>
  </Link>
);

const GithubHandle = ({ className }: { className?: string }) => (
  <>
    <a
      href="https://github.com/ricardodalcin/coding-explorations"
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        className,
        'flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 rounded-md'
      )}
    >
      <GithubIcon className="h-6 w-6 fill-slate-900" />
      <span className="sr-only">Your profile</span>
      <span aria-hidden="true">coding-explorations</span>
    </a>
  </>
);

export default function SideBarlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = usePathname();

  return (
    <>
      <div className="h-full w-full">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                    <ProjectHandle />

                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                              const isActive = pathname.includes(item.href);
                              return (
                                <li key={item.name}>
                                  <a
                                    href={`/demos${item.href}`}
                                    className={classNames(
                                      isActive
                                        ? 'bg-gray-50 text-indigo-600'
                                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                    )}
                                  >
                                    {item.icon && (
                                      <item.icon
                                        className={classNames(
                                          isActive
                                            ? 'text-indigo-600'
                                            : 'text-gray-400 group-hover:text-indigo-600',
                                          'h-6 w-6 shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                    )}
                                    {item.name}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-gray-400">
                            Your teams
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => {
                              const isActive = pathname.includes(team.href);

                              return (
                                <li key={team.name}>
                                  <a
                                    href={team.href}
                                    className={classNames(
                                      isActive
                                        ? 'bg-gray-50 text-indigo-600'
                                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                    )}
                                  >
                                    <span
                                      className={classNames(
                                        isActive
                                          ? 'text-indigo-600 border-indigo-600'
                                          : 'text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600',
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'
                                      )}
                                    >
                                      {team.initial}
                                    </span>
                                    <span className="truncate">
                                      {team.name}
                                    </span>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      </ul>
                    </nav>

                    <div className="flex h-16 -mx-2 shrink-0 items-center">
                      <GithubHandle className="py-2 px-2 w-full" />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <ProjectHandle />

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname.includes(item.href);
                      return (
                        <li key={item.name}>
                          <Link
                            href={`/demos${item.href}`}
                            className={classNames(
                              isActive
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            {item.icon && (
                              <item.icon
                                className={classNames(
                                  isActive
                                    ? 'text-indigo-600'
                                    : 'text-gray-400 group-hover:text-indigo-600',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                            )}
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Your teams
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => {
                      const isActive = pathname.includes(team.href);
                      return (
                        <li key={team.name}>
                          <Link
                            href={team.href}
                            className={classNames(
                              isActive
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <span
                              className={classNames(
                                isActive
                                  ? 'text-indigo-600 border-indigo-600'
                                  : 'text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600',
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'
                              )}
                            >
                              {team.initial}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <GithubHandle className="px-6 py-3" />
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 h-16 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Dashboard
          </div>

          <GithubHandle className="px-6 py-3" />
        </div>

        <main className="h-screen w-full overflow-hidden lg:pl-72">
          {children}
        </main>
      </div>
    </>
  );
}
