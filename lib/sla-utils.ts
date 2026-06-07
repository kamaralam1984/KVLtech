export function getTicketAge(createdAt: Date): { hours: number; minutes: number; display: string } {
  const ms = Date.now() - new Date(createdAt).getTime();
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const display = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { hours, minutes, display };
}

export function getSLAStatus(
  createdAt: Date,
  policy: { firstResponseMinutes: number; resolutionMinutes: number } | null,
  firstResponseAt: Date | null,
): "ok" | "warning" | "breached" {
  if (!policy) return "ok";
  const age = Date.now() - new Date(createdAt).getTime();
  const ageMinutes = age / 60000;
  if (!firstResponseAt && ageMinutes > policy.firstResponseMinutes) return "breached";
  if (ageMinutes > policy.resolutionMinutes * 0.8) return "warning";
  if (ageMinutes > policy.resolutionMinutes) return "breached";
  return "ok";
}
