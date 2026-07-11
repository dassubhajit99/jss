import { Card } from "../ui/index.jsx";
import { Avatar } from "./Avatar.jsx";

export function MemberCard({ name, role, photo }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-5 text-center">
      <Avatar name={name} photo={photo} />
      <div>
        <p className="font-display text-lg font-semibold text-ink">{name}</p>
        {role && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-600">{role}</p>}
      </div>
    </Card>
  );
}
