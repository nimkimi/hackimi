"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full justify-between items-center bg-transparent py-4 px-6">
      <div className="text-xl font-bold">Nima Hakimi</div>
      <div className="flex space-x-4">
        <Link
          href="#"
          className={`${
            pathname === "/about" ? "bg-gray-900" : ""
          } px-3 py-2 rounded-md text-sm font-medium`}
        >
          About
        </Link>
        <Link
          href="#"
          className={`${
            pathname === "" ? "bg-gray-900" : ""
          } px-3 py-2 rounded-md text-sm font-medium`}
        >
          Project
        </Link>
        <Link
          href="/contact"
          className={`${
            pathname === "/contact" ? "bg-gray-900" : ""
          } px-3 py-2 rounded-md text-sm font-medium`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}
