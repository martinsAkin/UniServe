import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (value: string) => format(new Date(value), "d MMM yyyy");
export const formatDateTime = (value: string) => format(new Date(value), "d MMM yyyy, HH:mm");
export const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true });

/** Mongo ids are long; show a short, stable reference. */
export const shortId = (id: string) => `#${id.slice(-6).toUpperCase()}`;
