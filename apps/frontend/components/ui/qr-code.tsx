import { useQRCode } from "next-qrcode";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  className?: string;
  type?: "svg" | "canvas" | "image";
}

export function QRCode({
  value,
  size = 200,
  level = "M",
  className,
  type = "svg",
}: QRCodeProps) {
  const { Image, Canvas, SVG } = useQRCode();

  // Validate that we have a valid value
  if (!value || value.trim() === "") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">No QR data</span>
      </div>
    );
  }

  const options = {
    level,
    margin: 2,
    width: size,
  };

  const commonProps = {
    text: value,
    options,
    className: cn("rounded", className),
  };

  switch (type) {
    case "canvas":
      return <Canvas {...commonProps} />;
    case "image":
      return <Image {...commonProps} />;
    case "svg":
    default:
      return <SVG {...commonProps} />;
  }
}
