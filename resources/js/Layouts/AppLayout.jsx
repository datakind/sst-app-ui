import { Link, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useTypedPage from '@/Hooks/useTypedPage';
import Dropdown from '@/Components/Fields/Dropdown';
import AppFooter from '@/Components/AppFooter';
import Banner from '@/Components/Banner';
import '../../css/landing.css';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import {
  ChartPieIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  HomeIcon,
  UsersIcon,
  Cog8ToothIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { formatModelName } from '@/utils/stringUtils';
import CookieConsent from '@/Components/CookieConsent';

const VisibilityType = Object.freeze({
  PUBLIC_ONLY: 'PUBLIC_ONLY',
  PRIVATE_ONLY: 'PRIVATE_ONLY',
  BOTH: 'BOTH',
  DATAKIND_ONLY: 'DATAKIND_ONLY', // This is a subset of PRIVATE_ONLY
});

var navigationAboveLine = [
  {
    name: 'Home',
    href: route('app-home'),
    icon: HomeIcon,
    visibility_type: VisibilityType.BOTH,
  },

  {
    name: 'Model Results',
    icon: ChartBarIcon,
    href: route('model-run-history'),
    visibility_type: VisibilityType.PRIVATE_ONLY,
  },
  {
    name: 'Data & Actions',
    icon: PlusCircleIcon,
    visibility_type: VisibilityType.PRIVATE_ONLY,
    children: [
      {
        name: 'Upload Data',
        href: route('file-upload'),
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Start Prediction',
        href: route('run-inference'),
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      { name: 'Manage Uploads', href: route('manage-uploads') },
    ],
  },
  {
    name: 'Data Dictionary',
    href: route('data-dictionary'),
    icon: BookOpenIcon,
    visibility_type: VisibilityType.BOTH,
  },
  {
    name: 'Admin Actions',
    icon: Cog8ToothIcon,
    visibility_type: VisibilityType.DATAKIND_ONLY,
    children: [
      {
        name: 'Set Institution',
        href: route('set-inst'),
        icon: DocumentDuplicateIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Add Datakinders',
        href: route('add-dk'),
        icon: DocumentDuplicateIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Create Model',
        href: route('create-model'),
        icon: ChartPieIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Create Institution',
        href: route('create-inst'),
        icon: DocumentDuplicateIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Edit Institution',
        href: route('edit-inst'),
        icon: ChartPieIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
      {
        name: 'Manage Invites',
        href: route('admin.invites'),
        icon: ClipboardDocumentListIcon,
        visibility_type: VisibilityType.DATAKIND_ONLY,
      },
    ],
  },
];

const navigationBelowLine = [
  /*{
    name: 'FAQ',
    href: route('FAQ'),
    icon: DocumentDuplicateIcon,
    visibility_type: VisibilityType.BOTH,
  },*/
  {
    name: 'Settings',
    href: route('profile.edit'),
    icon: Cog8ToothIcon,
    visibility_type: VisibilityType.PRIVATE_ONLY,
  },
  {
    name: 'Logout',
    href: route('logout'),
    icon: ArrowRightStartOnRectangleIcon,
    visibility_type: VisibilityType.PRIVATE_ONLY,
  },
  /*{
    name: 'Contact Us',
    href: '#',
    icon: PhoneIcon,
    visibility_type: VisibilityType.PUBLIC_ONLY,
  },
  {
    name: 'About',
    href: '#',
    icon: InformationCircleIcon,
    visibility_type: VisibilityType.PUBLIC_ONLY,
  },*/
];

// The title set in the page needs to match the name in the navigation map so that the highlighting works correctly.
export default function AppLayout({ title, children }) {
  const { auth, jetstream } = useTypedPage().props;
  const { institution, institution_view } = usePage().props;
  const hasInstId = institution?.inst_id;
  const user = auth.user;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navAboveLine, setNavAboveLine] = useState(navigationAboveLine);
  const [togglingInstitutionView, setTogglingInstitutionView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function dashboardNavHelper(item, modelData) {
    if (
      item.name == 'Model Results' &&
      modelData != null &&
      modelData.length != 0
    ) {
      // Create a newItem to drop the href that's there by default.
      item = {
        name: 'Model Results',
        icon: ChartBarIcon,
        visibility_type: VisibilityType.PRIVATE_ONLY,
        children: [],
      };
      const models = modelData
        .filter(elem => !elem.archived)
        .sort((a, b) => a.name.localeCompare(b.name));

      models.forEach(elem => {
        let transformedElem = {};
        transformedElem.name = elem.name;
        transformedElem.href = route('model-run-history.modelname', elem.name);
        transformedElem.visibility_type = VisibilityType.PRIVATE_ONLY;
        transformedElem.is_model = true;
        item.children.push(transformedElem);
      });

      if (modelData.some(elem => elem.archived)) {
        item.children.push({
          name: 'Archived Models',
          href: route('archived-models'),
          visibility_type: VisibilityType.PRIVATE_ONLY,
        });
      }
    }
    return item;
  }

  useEffect(() => {
    // Reset navigation to initial state when institution changes
    setNavAboveLine(navigationAboveLine);

    const updateNavigation = async () => {
      if (!hasInstId) {
        setNavAboveLine(
          navigationAboveLine.filter(item => item.name !== 'Model Results'),
        );
        return;
      }

      let newNav = [...navigationAboveLine];

      // Fetch models and update Model Results navigation
      try {
        const response = await axios.get('/models-api');
        newNav = newNav.map(item => dashboardNavHelper(item, response.data));
        newNav = newNav.filter(
          item =>
            !(
              item.name === 'Model Results' &&
              (!item.children || item.children.length === 0)
            ),
        );
      } catch {
        console.log('error during fetchModels');
      }

      setNavAboveLine(newNav);
    };

    updateNavigation();
  }, [hasInstId, user]);

  const renderNav = navMap =>
    navMap.map(item => {
      const navDisclosureActive =
        item.children &&
        (item.children.some(e => e.name === title) ||
          (item.name === 'Model Results' && title === 'Model Results'));

      return (!user && item.visibility_type == VisibilityType.PRIVATE_ONLY) ||
        (user && item.visibility_type == VisibilityType.PUBLIC_ONLY) ||
        (item.visibility_type == VisibilityType.DATAKIND_ONLY &&
          (user?.access_type != 'DATAKINDER' || institution_view)) ? (
        <></>
      ) : (
        <li key={item.name}>
          {!item.children ? (
            // Logout gets treated as a button as it requires a post request
            // TODO: does this have auto-protection against csrf via the Laravel middleware stack?
            item.name == 'Logout' ? (
              <Link href={item.href} method="post" className="app-nav-item">
                <item.icon aria-hidden="true" className="app-nav-icon" />
                Log out
              </Link>
            ) : (
              <a
                href={item.href}
                className="app-nav-item"
                {...(item.name == title ? { 'data-current': '' } : {})}
              >
                <item.icon aria-hidden="true" className="app-nav-icon" />
                {item.name}
              </a>
            )
          ) : (
            <Disclosure defaultOpen={navDisclosureActive} as="div">
              <DisclosureButton
                className="app-nav-item"
                {...(navDisclosureActive ? { 'data-current': '' } : {})}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <item.icon aria-hidden="true" className="app-nav-icon" />
                  <span className="truncate">{item.name}</span>
                </span>
                <ChevronRightIcon aria-hidden />
              </DisclosureButton>
              <DisclosurePanel as="ul" className="mt-1">
                {item.children
                  .filter(
                    subItem =>
                      !subItem.visibility_type ||
                      (subItem.visibility_type ===
                        VisibilityType.DATAKIND_ONLY &&
                        user?.access_type == 'DATAKINDER' &&
                        !institution_view) ||
                      (subItem.visibility_type ===
                        VisibilityType.PRIVATE_ONLY &&
                        user) ||
                      subItem.visibility_type === VisibilityType.BOTH,
                  )
                  .map(subItem => (
                    <li key={subItem.name}>
                      <DisclosureButton
                        as="a"
                        href={subItem.href}
                        className="app-nav-item"
                        data-nested=""
                        {...(subItem.name == title
                          ? { 'data-current': '' }
                          : {})}
                      >
                        {subItem.is_model
                          ? formatModelName(subItem.name)
                          : subItem.name}
                      </DisclosureButton>
                    </li>
                  ))}
              </DisclosurePanel>
            </Disclosure>
          )}
        </li>
      );
    });

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="text-secondary-dark flex items-center justify-between p-4">
          <img
            className="w-full pb-12"
            src="https://storage.googleapis.com/staging-sst-01-staging-static/edvise-logo.svg"
            alt="Edvise Logo"
          />
        </header>
        <main className="flex min-h-screen flex-col items-center bg-[#637381] p-6">
          <p className="text-center text-xl text-white">
            This application is not optimized for mobile devices at this time.
            Please visit the site on desktop.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {user?.access_type == 'DATAKINDER' && institution?.name && (
        <Banner>
          <a href={route('set-inst')}>{institution.name}</a>
          <label>
            <input
              className="mr-2"
              type="checkbox"
              checked={Boolean(institution_view)}
              disabled={togglingInstitutionView}
              onChange={e => {
                const on = e.target.checked;
                setTogglingInstitutionView(true);
                axios
                  .post('/institution-view-api', { institution_view: on })
                  .then(() => router.reload({ only: ['institution_view'] }))
                  .finally(() => setTogglingInstitutionView(false));
              }}
            />
            Institution view
          </label>
        </Banner>
      )}

      <div className="app-layout-body">
        <header className="shrink-0">
          <nav className="app-nav flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-6 shadow-sm">
            <div className="flex flex-col justify-between">
              <ul role="list" className="flex flex-1 flex-col gap-y-6">
                <li
                  className="flex w-full shrink-0 flex-col items-start pt-8"
                  key="logo"
                >
                  <a href={route('app-home')} className="block w-full">
                    <img
                      className="max-w-full pb-2"
                      src="https://storage.googleapis.com/staging-sst-01-staging-static/edvise-logo.svg"
                      alt="Edvise Logo"
                    />
                  </a>
                </li>
                <li key="navigation">
                  <ul>
                    {renderNav(navAboveLine)}
                    <li key="divider" aria-hidden="true">
                      <hr className="my-6 border-0 border-t border-[#dfe4ea]" />
                    </li>
                    {renderNav(navigationBelowLine)}
                    {user ? (
                      <li key="profile" className="flex hidden items-end">
                        <div className="flex w-full items-end gap-x-4 px-6 py-3 pb-48 text-sm/6 font-semibold text-[#637381] hover:bg-gray-50">
                          <span className="sr-only">Your profile</span>
                          <Dropdown>
                            <Dropdown.Trigger>
                              <button className="flex items-center gap-2 text-[#637381]">
                                <UsersIcon
                                  aria-hidden="true"
                                  className="size-6 shrink-0"
                                />
                                {user.name}
                                <ChevronDownIcon className="h-4 w-4" />
                              </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                              {/* <Dropdown.Link
                              href={route('#', user.current_team)}
                            >
                              Team Settings
                            </Dropdown.Link> */}
                              {jetstream.hasTeamFeatures && (
                                <>
                                  {jetstream.canCreateTeams && (
                                    <Dropdown.Link href={route('teams.create')}>
                                      Create New Team
                                    </Dropdown.Link>
                                  )}
                                  {user.all_teams.length > 1 && (
                                    <>
                                      <div className="border-t border-gray-200" />
                                      <div className="block px-4 py-2 text-xs text-gray-400">
                                        Switch Teams
                                      </div>
                                      {user.all_teams.map(team => (
                                        <form
                                          key={team.id}
                                          onSubmit={e => {
                                            e.preventDefault();
                                            router.put(
                                              route('current-team.update'),
                                              { team_id: team.id },
                                            );
                                          }}
                                        >
                                          <Dropdown.Link as="button">
                                            <div className="flex items-center">
                                              {team.id ===
                                                user.current_team_id && (
                                                <svg
                                                  className="me-2 h-5 w-5 text-green-400"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth="1.5"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                  />
                                                </svg>
                                              )}
                                              <div>{team.name}</div>
                                            </div>
                                          </Dropdown.Link>
                                        </form>
                                      ))}
                                    </>
                                  )}
                                </>
                              )}
                            </Dropdown.Content>
                          </Dropdown>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                </li>
              </ul>
              {user ? (
                <div></div>
              ) : (
                <div
                  className="flex items-center justify-between pt-6 pr-6 pb-6 pl-6"
                  id="login-register"
                >
                  <a
                    href={route('login')}
                    className="flex rounded-md text-sm/12 font-semibold text-[#637381] hover:underline"
                  >
                    Login
                  </a>
                  <div className="flex rounded-md text-sm/12 font-semibold text-[#637381] hover:underline">
                    &middot;
                  </div>
                  <a
                    href={route('register')}
                    className="flex rounded-md text-sm/12 font-semibold text-[#637381] hover:underline"
                  >
                    Register
                  </a>
                </div>
              )}
            </div>
          </nav>
        </header>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <main className="flex w-full flex-1 pt-12">{children}</main>
          <AppFooter />
          <a
            href="https://form.asana.com/?k=Vf_cGZUNTuZQTQ_TGbHPBw&d=6325821815997"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary fixed right-10 bottom-12 z-50"
            aria-label="Provide feedback"
          >
            <span className="text-sm font-medium">Feedback</span>
          </a>
          <CookieConsent />
        </div>
      </div>
    </div>
  );
}
