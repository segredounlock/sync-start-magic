import { QRCodeSVG } from "qrcode.react";
import { useSiteName } from "@/hooks/useSiteName";

interface BrandedQRCodeProps {
  value: string;
  size?: number;
  brandName?: string;
}

const BrandedQRCode = ({ value, size = 176, brandName }: BrandedQRCodeProps) => {
  const siteName = useSiteName();
  const displayName = brandName || siteName;

  return (
    <div className="bg-[#0a0a0a] rounded-2xl shadow-lg p-5 flex flex-col items-center gap-3 border border-border/30">
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          includeMargin={false}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-white font-display text-sm font-bold tracking-wide">{displayName}</span>
      </div>
    </div>
  );
};

export default BrandedQRCode;
