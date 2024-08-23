import Link from "next/link";

export default function GeneralLink({
  href,
  title,
  children,
}: {
  href: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link className="hover:underline font-bold" href={href}>
      {title ? title : children}
    </Link>
  );
}
