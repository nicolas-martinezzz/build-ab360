"use client";

type Props = { webm: string; mp4: string };

export function HeroBackdropGif({ webm, mp4 }: Props) {
  return (
    <video
      aria-hidden
      autoPlay
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 motion-reduce:hidden [&.loaded]:opacity-100"
      loop
      muted
      onCanPlay={(e) => (e.currentTarget as HTMLVideoElement).classList.add("loaded")}
      playsInline
      preload="none"
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
