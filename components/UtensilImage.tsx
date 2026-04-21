"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type UtensilImageProps = {
  id: string;
  name: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

const IMAGE_EXTENSIONS = ["jpg", "png", "jpeg"] as const;

export default function UtensilImage({
  id,
  name,
  sizes,
  className = "object-cover",
  priority = false,
}: UtensilImageProps) {
  const candidates = useMemo(
    () => IMAGE_EXTENSIONS.map((extension) => `/utensils/${id}.${extension}`),
    [id]
  );
  const [index, setIndex] = useState(0);

  if (index >= candidates.length) {
    return null;
  }

  return (
    <Image
      key={candidates[index]}
      src={candidates[index]}
      alt={name}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className={className}
      onError={() => setIndex((prev) => prev + 1)}
    />
  );
}