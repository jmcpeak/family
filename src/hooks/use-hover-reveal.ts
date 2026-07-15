"use client";

import { useCallback, useState } from "react";

interface HoverRevealProps {
  onMouseEnter: () => void;
  onMouseOver: () => void;
  onMouseMove: () => void;
  onMouseLeave: () => void;
  onPointerEnter: () => void;
  onPointerOver: () => void;
  onPointerMove: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
}

interface HoverReveal {
  getRevealProps: (id: string) => HoverRevealProps;
  isRevealed: (id: string) => boolean;
}

export function useHoverReveal(): HoverReveal {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const getRevealProps = useCallback(
    (id: string): HoverRevealProps => ({
      onMouseEnter: () => setRevealedId(id),
      onMouseOver: () => setRevealedId(id),
      onMouseMove: () => setRevealedId(id),
      onMouseLeave: () => setRevealedId(null),
      onPointerEnter: () => setRevealedId(id),
      onPointerOver: () => setRevealedId(id),
      onPointerMove: () => setRevealedId(id),
      onPointerLeave: () => setRevealedId(null),
      onFocus: () => setRevealedId(id),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setRevealedId(null);
        }
      },
    }),
    [],
  );

  const isRevealed = useCallback(
    (id: string): boolean => revealedId === id,
    [revealedId],
  );

  return { getRevealProps, isRevealed };
}
