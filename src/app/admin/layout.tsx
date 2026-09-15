import Link from "next/link";
import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminUser("/admin");

  if (!admin) {
    return (
      <div className="mx-auto px-6 py-20 text-center" style={{ maxWidth: 980 }}>
        <h1 className="text-[34px] font-semibold leading-[1.47] text-ink">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-12" style={{ maxWidth: 1200 }}>
      <nav className="flex gap-6 mb-8 pb-4 border-b border-hairline">
        <Link href="/admin" className="text-sm font-medium text-primary hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/products" className="text-sm text-ink-muted-48 hover:text-ink transition-colors">
          Products
        </Link>
        <Link href="/admin/orders" className="text-sm text-ink-muted-48 hover:text-ink transition-colors">
          Orders
        </Link>
      </nav>
      {children}
    </div>
  );
}
