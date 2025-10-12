import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLink {
  href: string;
  label: string;
}

interface ValidatorNavProps {
  links: NavLink[];
}

const ValidatorNav: React.FC<ValidatorNavProps> = ({ links }) => {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 mb-6">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded font-medium transition-colors ${
            pathname === link.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default ValidatorNav;
