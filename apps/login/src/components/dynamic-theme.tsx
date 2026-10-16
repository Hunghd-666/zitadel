"use client";

import { Logo } from "@/components/logo";
import { useResponsiveLayout } from "@/lib/theme-hooks";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import React, { Children, ReactNode } from "react";
import { Card } from "./card";
import { ThemeWrapper } from "./theme-wrapper";

/**
 * DynamicTheme component handles layout switching between traditional top-to-bottom
 * and modern side-by-side layouts based on NEXT_PUBLIC_THEME_LAYOUT.
 *
 * For side-by-side layout:
 * - First child: Goes to left side (title, description, etc.)
 * - Second child: Goes to right side (forms, buttons, etc.)
 * - Single child: Falls back to right side for backward compatibility
 *
 * For top-to-bottom layout:
 * - All children rendered in traditional centered layout
 */
export function DynamicTheme({
  branding,
  children,
}: {
  children: ReactNode | ((isSideBySide: boolean) => ReactNode);
  branding?: BrandingSettings;
}) {
  const { isSideBySide } = useResponsiveLayout();

  // Resolve children immediately to avoid passing functions through React
  const actualChildren: ReactNode = React.useMemo(() => {
    if (typeof children === "function") {
      return (children as (isSideBySide: boolean) => ReactNode)(isSideBySide);
    }
    return children;
  }, [children, isSideBySide]);

  return (
    <ThemeWrapper branding={branding}>
      {isSideBySide
        ? // Side-by-side layout: first child goes left, second child goes right
          (() => {
            const childArray = Children.toArray(actualChildren);
            const leftContent = childArray[0] || null;
            const rightContent = childArray[1] || null;

            // If there's only one child, it's likely the old format - keep it on the right side
            const hasLeftRightStructure = childArray.length === 2;

            return (
              <div className="relative mx-auto w-full max-w-[1100px] px-8 py-4">
                <Card padding="p-0" className="overflow-hidden shadow-md">
                  <div className="flex min-h-[540px]">
                    {/* Left side: labxgame brand panel — orange/blue gradient art, independent of label policy */}
                    <div className="labx-brand-panel relative flex w-[44%] flex-col overflow-hidden p-8 lg:p-10">
                      {/* faint concentric rings, bottom-left */}
                      <svg
                        className="absolute -bottom-20 -left-20 h-72 w-72 text-white/[0.08]"
                        viewBox="0 0 200 200"
                        fill="none"
                        aria-hidden="true"
                      >
                        {[40, 70, 100, 130].map((r) => (
                          <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeWidth="1.5" />
                        ))}
                      </svg>
                      <PixelScatter variant="panel" className="absolute bottom-10 right-8" />

                      <div className="relative flex flex-1 flex-col items-center justify-center pb-12 text-center">
                        {/* placeholder mark — replace with final logo asset once branding is decided */}
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" role="img" aria-label="labxgame">
                          <rect
                            x="11"
                            y="11"
                            width="30"
                            height="30"
                            rx="7"
                            transform="rotate(45 26 26)"
                            stroke="#FFFFFF"
                            strokeWidth="4"
                          />
                          <rect x="20" y="20" width="12" height="12" rx="3" transform="rotate(45 26 26)" fill="#FFFFFF" />
                        </svg>
                        <span className="mt-1 text-[32px] font-semibold tracking-tight text-white">labxgame</span>
                        <p className="mt-1 max-w-[250px] text-[15px] font-normal leading-relaxed text-white/90">
                          Secure access to every labxgame experience.
                        </p>
                      </div>
                    </div>

                    {/* Right side: page title + form content, stacked */}
                    <div className="relative flex flex-1 items-center justify-center p-6 lg:p-10">
                      <PixelScatter variant="form" className="absolute right-6 top-6" />
                      <div className="w-full max-w-[400px] space-y-6 text-left [&_h1]:!text-left [&_h1]:text-[28px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight">
                        {leftContent}
                        {hasLeftRightStructure && rightContent}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })()
        : // Traditional top-to-bottom layout - center title/description, left-align forms
          (() => {
            const childArray = Children.toArray(actualChildren);
            const titleContent = childArray[0] || null;
            const formContent = childArray[1] || null;
            const hasMultipleChildren = childArray.length > 1;

            return (
              <div className="relative mx-auto w-full max-w-[440px] px-4 py-4">
                <Card>
                  <div className="mx-auto flex flex-col items-center space-y-8">
                    <div className="relative flex flex-row items-center justify-start">
                      {branding && (
                        <Logo
                          lightSrc={branding.lightTheme?.logoUrl}
                          darkSrc={branding.darkTheme?.logoUrl}
                          height={40}
                          width={150}
                        />
                      )}
                    </div>

                    {hasMultipleChildren ? (
                      <>
                        {/* Title and description - left aligned (h1 is text-center in globals.scss) */}
                        <div className="mb-4 flex w-full flex-col items-start text-left [&_h1]:!text-left">{titleContent}</div>

                        {/* Form content - left aligned */}
                        <div className="w-full">{formContent}</div>
                      </>
                    ) : (
                      // Single child - use original behavior
                      <div className="w-full">{actualChildren}</div>
                    )}

                    <div className="flex flex-row justify-between"></div>
                  </div>
                </Card>
              </div>
            );
          })()}
    </ThemeWrapper>
  );
}

/**
 * Decorative scatter of small rounded squares. `panel` renders translucent
 * white/peach squares for the orange brand panel; `form` renders the
 * blue/orange mix for the top-right of the form column.
 */
function PixelScatter({ variant, className = "" }: { variant: "panel" | "form"; className?: string }) {
  // [x, y, size, fill, opacity] — free placement, mixed sizes, no fixed grid
  const panelRects: Array<[number, number, number, string, number]> = [
    [120, 6, 14, "#FFFFFF", 0.5],
    [148, 18, 18, "#FFFFFF", 0.65],
    [96, 24, 12, "#FFD1A8", 0.5],
    [66, 40, 16, "#FFFFFF", 0.4],
    [132, 44, 11, "#FFD1A8", 0.7],
    [162, 56, 15, "#FFFFFF", 0.5],
    [40, 62, 13, "#FFD1A8", 0.45],
    [104, 68, 18, "#FFFFFF", 0.75],
    [76, 86, 12, "#FFFFFF", 0.55],
    [140, 90, 16, "#FFD1A8", 0.6],
    [58, 104, 14, "#FFFFFF", 0.65],
    [112, 108, 12, "#FFFFFF", 0.5],
  ];
  const formRects: Array<[number, number, number, string, number]> = [
    [128, 0, 16, "#2563EB", 0.95],
    [102, 2, 12, "#FFB280", 0.9],
    [150, 8, 18, "#3B82F6", 0.85],
    [76, 12, 10, "#93B4F5", 0.8],
    [120, 26, 14, "#F97316", 0.9],
    [58, 30, 12, "#DBEAFE", 0.85],
    [146, 38, 11, "#7BA7F0", 0.7],
    [96, 44, 15, "#2563EB", 0.75],
    [40, 58, 10, "#FDBA74", 0.7],
    [70, 70, 12, "#DBEAFE", 0.75],
    [118, 62, 9, "#FFE4CC", 0.85],
  ];
  const rects = variant === "panel" ? panelRects : formRects;
  return (
    <svg
      viewBox={variant === "panel" ? "0 0 182 140" : "0 0 170 92"}
      width={variant === "panel" ? 170 : 150}
      aria-hidden="true"
      className={className}
    >
      {rects.map(([x, y, size, fill, opacity], i) => (
        <rect key={i} x={x} y={y} width={size} height={size} rx={Math.min(4, size / 3)} fill={fill} fillOpacity={opacity} />
      ))}
    </svg>
  );
}
