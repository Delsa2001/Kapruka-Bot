import Image from "next/image";
import { KAPRUKA_BRAND } from "@/lib/kapruka-brand";

type Props = {
  /** Height in px; width scales from logo aspect ratio */
  height?: number;
  className?: string;
};

export function KaprukaLogo({ height = 36, className = "" }: Props) {
  const width = Math.round(height * 4.2);

  return (
    <a
      href={KAPRUKA_BRAND.siteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="Kapruka.com"
    >
      <Image
        src={KAPRUKA_BRAND.logoPath}
        alt="Kapruka"
        width={width}
        height={height}
        className="h-auto w-auto max-w-none object-contain object-left"
        style={{ height, width: "auto", maxHeight: height }}
        priority
      />
    </a>
  );
}
