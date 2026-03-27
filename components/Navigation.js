// components/Navigation.js
'use client';

import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter(); // must be here, inside component
  const { isLoggedIn, logout } = useAuth();

    // Base links
  const links = [{ href: '/', label: 'Asteroids' }];

  // Conditional links
  if (isLoggedIn) {
    links.push({ href: '/profile', label: 'Profile' });
    links.push({ label: 'Logout', onClick: null }); // placeholder
  } else {
    links.push(
      { href: '/signup', label: 'Signup' },
      { href: '/login', label: 'Login' }
    );
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="h-[2px] bg-yellow-500 w-full" />
      <div className="flex justify-center py-3">
        <ul className="flex gap-3">
          {links.map(({ href, label, onClick }) => {
            const isActive = href ? pathname === href : false;

            // Define logout click here where router is available
            const handleClick = label === 'Logout' 
              ? () => {
                  logout();
                  router.push('/'); // redirect after logout
                }
              : onClick;

            return (
              <li key={label}>
                {handleClick ? (
                  <button
                    onClick={handleClick}
                    type="button"
                    className="px-4 py-1 text-sm border rounded-sm transition inline-block border-yellow-500 text-white hover:text-yellow-400"
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    href={href}
                    className={`
                      px-4 py-1 text-sm border rounded-sm transition inline-block
                      ${isActive
                        ? 'border-cyan-400 text-cyan-300 shadow-[0_0_6px_#00eaff]'
                        : 'border-cyan-500/40 text-gray-400 hover:text-white hover:border-cyan-400'}
                        transition-all
                    `}
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}