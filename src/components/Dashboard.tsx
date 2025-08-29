'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useSpaces, Space } from '../contexts/SpacesContext';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, Cog6ToothIcon, ArrowLeftIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
} from '@heroicons/react/20/solid';
import { SpacesNavigation } from './SpacesNavigation';

const navigation = [
  {
    name: 'All Notes',
    href: '/all-notes',
    icon: Squares2X2Icon,
    title: 'All Notes',
  },
  {
    name: 'Daily Notes',
    href: '/daily-notes',
    icon: CalendarDaysIcon,
    title: 'Daily Notes',
  },
  {
    name: 'Flashcards',
    href: '/flashcards',
    icon: RectangleStackIcon,
    title: 'Flashcards',
  },
  {
    name: 'Spaces',
    href: '/spaces',
    icon: UserGroupIcon,
    title: 'Spaces',
  },
  {
    name: 'Edit Later',
    href: '/edit-later',
    icon: ClockIcon,
    title: 'Edit Later',
  },
];

const userNavigation = [
  { name: 'Sign out', href: '#', action: 'logout' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface DashboardProps {
  children: React.ReactNode;
  onSpaceSelect?: (space: Space) => Promise<void>;
  selectedSpaceTitle?: string | null;
}

export default function Dashboard({ children, onSpaceSelect, selectedSpaceTitle }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleUserAction = (action: string) => {
    if (action === 'logout') {
      logout();
    }
  };

  const handleSpaceSelect = async (space: Space) => {
    console.log('Selected space:', space);
    if (onSpaceSelect) {
      await onSpaceSelect(space);
    }
  };

  // Get current navigation item for title
  const currentNavItem = navigation.find((item) => item.href === pathname);
  const pageTitle = selectedSpaceTitle || currentNavItem?.title || 'Dashboard';

  const renderNavigationItems = () => {
    return navigation.map((item) => {
      const isCurrent = pathname === item.href;

      return (
        <li key={item.name}>
          <Link
            href={item.href}
            className={classNames(
              isCurrent ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600',
              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
            )}
          >
            <item.icon
              aria-hidden="true"
              className={classNames(isCurrent ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600', 'size-6 shrink-0')}
            />
            {item.name}
          </Link>
        </li>
      );
    });
  };

  const renderSpacesSection = () => {
    const isSpacesPage = pathname === '/spaces';

    if (!isSpacesPage) return null;

    return (
      <li className="-mx-9 pl-1">
        <div>
          <SpacesNavigation onSpaceSelect={handleSpaceSelect} />
        </div>
      </li>
    );
  };

  return (
    <>
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              {/* Sidebar component */}
              <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 pb-4">
                {/* User profile section at top of sidebar */}
                <div className="flex h-16 shrink-0 items-center">
                  <Menu as="div" className="relative w-full">
                    <MenuButton className="flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-8 rounded-full bg-blue-50 outline -outline-offset-1 outline-black/5"
                      />
                      <span className="truncate">{user?.username || 'User'}</span>
                      <ChevronDownIcon aria-hidden="true" className="ml-auto size-5 text-gray-400" />
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute top-full left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                          <a
                            href={item.href}
                            onClick={(e) => {
                              if (item.action) {
                                e.preventDefault();
                                handleUserAction(item.action);
                              }
                            }}
                            className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-blue-50 data-focus:outline-hidden"
                          >
                            {item.name}
                          </a>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>

                <nav className="relative flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {renderNavigationItems()}
                      </ul>
                    </li>
                    {renderSpacesSection()}
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4 pb-4">
            {/* User profile section at top of sidebar */}
            <div className="flex h-16 shrink-0 items-center">
              <Menu as="div" className="relative w-full">
                <MenuButton className="flex w-full items-center gap-x-4 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-8 rounded-full bg-blue-50 outline -outline-offset-1 outline-black/5"
                  />
                  <span className="truncate">{user?.username || 'User'}</span>
                  <ChevronDownIcon aria-hidden="true" className="ml-auto size-5 text-gray-400" />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute top-full left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          if (item.action) {
                            e.preventDefault();
                            handleUserAction(item.action);
                          }
                        }}
                        className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-blue-50 data-focus:outline-hidden"
                      >
                        {item.name}
                      </a>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {renderNavigationItems()}
                  </ul>
                </li>
                {renderSpacesSection()}
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-4 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Page title with back arrow */}
              <div className="flex items-center gap-2">
                {
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600 ">
                    <span className="sr-only">Go back</span>
                    <ArrowLeftIcon aria-hidden="true" className="size-5" />
                  </button>
                }
                <h1 className="text-xl font-semibold text-gray-500">{pageTitle}</h1>
              </div>

              <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
                {
                  <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">More options</span>
                    <EllipsisHorizontalIcon aria-hidden="true" className="size-6" />
                  </button>
                }
              </div>
            </div>
          </div>

                     <main className="py-0">
             <div className="px-0">{children}</div>
           </main>
        </div>
      </div>
    </>
  );
}
