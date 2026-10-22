import Link from "next/link";
import { Meeka } from "@/components/meeka/meeka";

/** 404（产品文档 §7.2）— IP: meeka-error 180-280px */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      {/* 图内已含 404 标题与说明文案，不再叠加文字 */}
      <Meeka state="error" size={340} alt="哎呀，页面迷路了" />
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:opacity-90"
        >
          返回首页
        </Link>
        <Link
          href="/resources"
          className="flex h-10 items-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-white"
        >
          去资源市场
        </Link>
      </div>
    </div>
  );
}
