"use client";

type Props = { src: string };

export function HeroBackdropGif({ src }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- animated GIF hero backdrop
    <img
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 motion-reduce:hidden [&.loaded]:opacity-100"
      decoding="async"
      fetchPriority="low"
      loading="lazy"
      onLoad={(e) => (e.currentTarget as HTMLImageElement).classList.add("loaded")}
      src={src}
    />
  );
}
