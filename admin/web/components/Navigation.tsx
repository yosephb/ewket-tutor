import Link from 'next/link';

export default function Navigation() {
  const navItems = [
    {
      href: '/documents',
      label: 'Documents'
    },
    {
      href: '/chunks',
      label: 'Chunks'
    }
  ];

  return (
    <nav className="flex gap-4 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-gray-600 hover:text-gray-900"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 