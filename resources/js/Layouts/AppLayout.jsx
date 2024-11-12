import { router } from '@inertiajs/core';
import { Link, Head, usePage } from '@inertiajs/react';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import useTypedPage from '@/Hooks/useTypedPage';
import Dropdown from '@/Components/Fields/Dropdown';
import AppLogo from '@/Components/Icons/AppLogo';
import { ChevronDownIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function AppLayout({ title, renderHeader, children }) {
    const { auth, jetstream } = useTypedPage().props;
    const user = auth.user;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const profilePhoto = user
        ? `https://ui-avatars.com/api/?name=${user.name}&color=303030&background=ffffff`
        : 'none';

    const pathname = window.location.pathname;
    const openFeedbackForm = () => {
        const feedbackFormUrl = import.meta.env.VITE_FEEDBACK_FORM_URL;
        window.open(feedbackFormUrl, '_blank');
    };


    const renderNavLinks = () => (
        ['home', 'FAQ', 'data-dictionary'].map((routeName) => (
            <Link
                key={routeName}
                href={route(routeName)}
                className={classNames('text-gray-900 hover:underline', {
                    'text-primary underline': pathname === `/${routeName}`,
                })}
            >
                {routeName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
            </Link>
        ))
    );

    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col">
                <header className="flex items-center justify-between p-4 bg-gray-900 text-secondary-dark">
                    <AppLogo />
                    <nav className="flex items-center gap-4">
                        {renderNavLinks()}
                    </nav>
                </header>
                <main className="flex flex-col items-center p-6">
                    <p className="text-center text-gray-700">
                        This application is not optimized for mobile devices at this time. Please visit the site on desktop.
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <header className="sticky top-0 w-full bg-white shadow-md z-50">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-4">
                        <a href={route('home')}>
                            <AppLogo className="w-32 h-auto" />
                        </a>
                    </div>
                    <div>
                        <nav className={classNames('flex items-center gap-6', { 'hidden': !user })}>
                            {renderNavLinks()}
                        </nav>
                        {user ? (
                            <div className="flex items-center gap-4 pt-4 justify-end">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 text-gray-900">
                                            <img
                                                className="h-8 w-8 rounded-full border border-secondary-dark"
                                                src={profilePhoto}
                                                alt="User Profile"
                                            />
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('teams.show', user.current_team)}>
                                            Team Settings
                                        </Dropdown.Link>
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
                                                        {user.all_teams.map((team) => (
                                                            <form key={team.id} onSubmit={(e) => {
                                                                e.preventDefault();
                                                                switchToTeam(team);
                                                            }}>
                                                                <Dropdown.Link as="button">
                                                                    <div className="flex items-center">
                                                                        {team.id === user.current_team_id && (
                                                                            <svg className="me-2 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        ) : (
                            <div className="flex gap-6 items-center">
                                <Link href={route('login')} className="text-secondary-dark hover:text-secondary hover:underline">
                                    Sign in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-4 py-2 rounded-full bg-primary text-white border border-primary hover:bg-transparent hover:text-primary"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="z-50 cursor-pointer fixed bottom-10 hover:bg-primary-dark shadow-md right-10 bg-primary rounded-full p-2 px-4 text-white text-sm">
                <button onClick={openFeedbackForm}>Feedback</button>
            </div>
            <main className="pt-12 min-h-screen">{children}</main>

            <footer className="py-6 bg-gray-300 shadow-inner text-center">
                <nav className="flex justify-center gap-8 text-sm text-secondary-dark font-semibold pr-12">
                    <Link href={route('privacy-policy')} className="text-secondary-dark hover:underline hover:text-secondary">
                        Privacy Policy
                    </Link>
                    <Link href={route('terms-of-service')} className="text-secondary-dark hover:underline hover:text-secondary">
                        Terms of Service
                    </Link>
                    <Link href={route('license')} className="text-secondary-dark hover:underline hover:text-secondary">
                        License
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
