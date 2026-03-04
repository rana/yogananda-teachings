/**
 * Surface — semantic container that sets design system data attributes.
 *
 * Server component. Sets data-register, data-voice, data-rasa, and
 * data-publication on its DOM element. CSS rules in the design system
 * (registers.css) respond to these attributes.
 *
 * Usage:
 *   <Surface register="sacred" voice="contemplative" rasa="shanta">
 *     <p>Yogananda's words...</p>
 *   </Surface>
 */

import type { ReactNode } from "react";

type Register = "sacred" | "reverential" | "instructional" | "functional" | "ambient";
type Voice = "contemplative" | "communal";
type Rasa = "shanta" | "adbhuta" | "karuna" | "vira" | "bhakti";
type Element = "article" | "section" | "aside" | "div" | "main" | "nav" | "header" | "footer";

interface SurfaceProps {
  children: ReactNode;
  register?: Register;
  voice?: Voice;
  rasa?: Rasa;
  publication?: string;
  as?: Element;
  className?: string;
  id?: string;
}

export function Surface({
  children,
  register,
  voice,
  rasa,
  publication,
  as: Tag = "div",
  className,
  id,
}: SurfaceProps) {
  const attrs: Record<string, string | undefined> = {};
  if (register) attrs["data-register"] = register;
  if (voice) attrs["data-voice"] = voice;
  if (rasa) attrs["data-rasa"] = rasa;
  if (publication) attrs["data-publication"] = publication;

  return (
    <Tag {...attrs} className={className} id={id}>
      {children}
    </Tag>
  );
}
