import { pct, tgt, rp } from "@/lib/api";

export const Avatar = ({ u }: { u: any }) => {
  const i = u?.image ?? u?.image_url ?? u?.profile_picture ?? u?.avatar;
  // eslint-disable-next-line @next/next/no-img-element
  return i ? <img className="av" src={i} alt="" /> : <span className="av">{(u?.username || "?")[0].toUpperCase()}</span>;
};

export const Bar = ({ t }: { t: any }) => (
  <>
    <div className="bar"><i style={{ width: pct(t) + "%" }} /></div>
    <div className="sm mut">{pct(t)}% dari target {rp(tgt(t))}</div>
  </>
);
