"use client";

import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { investorPdfButtonCopy } from "@/lib/investors/shared-copy";

interface PdfDownloadButtonProps {
  variant?: "primary" | "action" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
  /** Called before download – return false to prevent download (e.g. show modal instead) */
  onBeforeDownload?: () => boolean;
  className?: string;
}

/**
 * Client-side PDF download button.
 * Dynamically imports @react-pdf/renderer + OnePagerDocument only when
 * the user clicks, keeping the initial bundle small.
 */
export function PdfDownloadButton({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  label,
  onBeforeDownload,
  className,
}: PdfDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);
  const { locale } = useTranslation();
  const copy = investorPdfButtonCopy[getTierOneLocale(locale)];

  const handleClick = useCallback(async () => {
    if (onBeforeDownload && !onBeforeDownload()) return;

    setGenerating(true);
    try {
      // Dynamic import keeps @react-pdf/renderer out of the initial bundle
      const [{ pdf }, { OnePagerDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/investors/one-pager-pdf"),
      ]);

      const blob = await pdf(<OnePagerDocument locale={locale} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "LeetGaming-PRO-Investment-Overview.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to static placeholder
      const link = document.createElement("a");
      link.href = "/investors/leetgaming-pro-one-pager.pdf";
      link.download = "LeetGaming-PRO-Investment-Overview.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setGenerating(false);
    }
  }, [locale, onBeforeDownload]);

  return (
    <EsportsButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      glow={variant === "primary"}
      onClick={handleClick}
      loading={generating}
      className={className}
      startContent={
        !generating ? (
          <Icon icon="solar:download-bold" width={size === "sm" ? 16 : 20} />
        ) : undefined
      }
    >
      {generating ? copy.generatingPdf : (label ?? copy.downloadOnePager)}
    </EsportsButton>
  );
}
