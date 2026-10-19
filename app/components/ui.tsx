import { pct, tgt, bal, rp } from "@/lib/api";

export const Avatar = ({ u, className = "" }: { u: any; className?: string }) => {
  const i = u?.profile_image ?? u?.image ?? u?.image_url ?? u?.profile_picture ?? u?.avatar;
  const initial = (u?.username || "?")[0].toUpperCase();
  // eslint-disable-next-line @next/next/no-img-element
  return i ? (
    <img className={`av ${className}`} src={i} alt={u?.username || "Avatar"} />
  ) : (
    <span className={`av ${className}`}>{initial}</span>
  );
};

export const Bar = ({ t }: { t: any }) => {
  const percentage = pct(t);
  const remaining = Math.max(0, tgt(t) - bal(t));
  const isComplete = percentage >= 100;

  return (
    <div style={{ marginTop: "12px" }}>
      <div className="bar">
        <i
          style={{
            width: `${percentage}%`,
            background: isComplete
              ? "linear-gradient(90deg, #10B981, #059669)"
              : "linear-gradient(90deg, #0F172A, #334155)",
          }}
        />
      </div>
      <div className="progress-info">
        <span>
          <b style={{ color: "var(--ink)", fontWeight: 600 }}>{percentage}%</b>{" "}
          {isComplete ? "tercapai" : `dari ${rp(tgt(t))}`}
        </span>
        {tgt(t) > 0 && (
          <span className="xs mut">
            {isComplete ? "Target tercapai 🎉" : `Sisa ${rp(remaining)}`}
          </span>
        )}
      </div>
    </div>
  );
};
