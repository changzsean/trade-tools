import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}

export function SectionHeading({ title, description, href, actionLabel = "查看全部" }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-brand">
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
