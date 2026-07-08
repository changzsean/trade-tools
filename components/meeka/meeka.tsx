/**
 * MEEKA IP 标准组件（产品文档 §13.4）
 * <Meeka state="wave" size={64} />
 * 职责：自动选择正确 PNG、按 2x 高清源图缩放、不含业务文案。
 * 资产：/public/assets/meeka/meeka-{state}[-512|-256|-128|-64].png（真透明 alpha）
 */

export type MeekaState =
  | "wave"
  | "login"
  | "register"
  | "profile"
  | "thinking"
  | "discover"
  | "cheer"
  | "success"
  | "empty"
  | "error";

const FILE_MAP: Record<MeekaState, string> = {
  wave: "meeka-wave1", // 首页/发布入口用无气泡版（§7.2）
  login: "meeka-login",
  register: "meeka-register",
  profile: "meeka-profile",
  thinking: "meeka-thinking",
  discover: "meeka-discover",
  cheer: "meeka-cheer",
  success: "meeka-success",
  empty: "meeka-empty",
  error: "meeka-error",
};

const AVAILABLE_SIZES = [64, 128, 256, 512] as const;

/** Retina 清晰度规范（§7.3）：展示 N px 时源图至少 2N px */
function pickSource(state: MeekaState, size: number): string {
  const need = size * 2;
  const chosen = AVAILABLE_SIZES.find((s) => s >= need) ?? 512;
  const base = FILE_MAP[state];
  return chosen === 512 ? `/assets/meeka/${base}.png` : `/assets/meeka/${base}-${chosen}.png`;
}

export function Meeka({
  state,
  size = 64,
  className = "",
  alt,
}: {
  state: MeekaState;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pickSource(state, size)}
      alt={alt ?? `Meeka ${state}`}
      width={size}
      height={size}
      loading="lazy"
      className={`select-none object-contain ${className}`}
      draggable={false}
    />
  );
}
