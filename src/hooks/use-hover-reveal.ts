"use client";

import { useCallback, useState } from "react";

interface HoverRevealProps {
  onMouseEnter: () => void;
  onMouseOver: () => void;
  onMouseLeave: () => void;
  onPointerEnter: () => void;
  onPointerOver: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
}

interface HoverReveal {
  getRevealProps: (id: string) => HoverRevealProps;
  isRevealed: (id: string) => boolean;
}

function setRevealedIdIfChanged(
  setRevealedId: React.Dispatch<React.SetStateAction<string | null>>,
  id: string | null,
): void {
  setRevealedId((current) => (current === id ? current : id));
}

export function useHoverReveal(): HoverReveal {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const getRevealProps = useCallback((id: string): HoverRevealProps => {
    const reveal = (): void => {
      setRevealedIdIfChanged(setRevealedId, id);
    };
    const clear = (): void => {
      setRevealedIdIfChanged(setRevealedId, null);
    };

    return {
      onMouseEnter: reveal,
      onMouseOver: reveal,
      onMouseLeave: clear,
      onPointerEnter: reveal,
      onPointerOver: reveal,
      onPointerLeave: clear,
      onFocus: reveal,
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clear();
        }
      },
    };
  }, []);

  const isRevealed = useCallback(
    (id: string): boolean => revealedId === id,
    [revealedId],
  );

  return { getRevealProps, isRevealed };
}
