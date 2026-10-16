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
                    {/* Left side: labxgame brand panel — fixed brand art, independent of label policy */}
                    <div className="relative flex w-2/5 flex-col overflow-hidden bg-gradient-to-b from-[#FF8A3D] via-[#E86A17] to-[#B84A06] p-8 lg:p-10">
                      <PixelCluster className="absolute right-0 top-0" />
                      <PixelCluster className="absolute bottom-0 left-0" mirrored />

                      {/* TODO: replace with final logo asset once branding is decided */}
                      <svg width="150" height="36" viewBox="0 0 150 36" role="img" aria-label="labxgame">
                        <rect x="2" y="4" width="13" height="13" rx="3.5" fill="#FFFFFF" />
                        <rect x="19" y="4" width="13" height="13" rx="3.5" fill="#FFFFFF" fillOpacity="0.75" />
                        <rect x="2" y="20" width="13" height="13" rx="3.5" fill="#FFFFFF" fillOpacity="0.75" />
                        <rect x="19" y="20" width="13" height="13" rx="3.5" fill="#FFFFFF" />
                        <text
                          x="42"
                          y="25"
                          fontFamily="Inter, Arial, Helvetica, sans-serif"
                          fontSize="21"
                          fontWeight="700"
                          letterSpacing="-0.5"
                          fill="#FFFFFF"
                        >
                          labxgame
                        </text>
                      </svg>

                      <div className="flex flex-1 items-center">
                        <p className="relative max-w-[300px] text-2xl font-semibold leading-snug text-white">
                          Secure access to every labxgame experience
                        </p>
                      </div>
                    </div>

                    {/* Right side: page title + form content, stacked */}
                    <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
                      <div className="w-full max-w-[400px] space-y-6 text-left [&_h1]:!text-left [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-snug">
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
 * Decorative mosaic of small rounded squares for the brand panel corners.
 * `mirrored` flips the cluster so the same asset works top-right and bottom-left.
 */
function PixelCluster({ className = "", mirrored = false }: { className?: string; mirrored?: boolean }) {
  const cells: Array<[number, number, string, number]> = [
    [2, 0, "#FFFFFF", 0.7],
    [3, 0, "#4C7BF0", 0.6],
    [1, 1, "#FFFFFF", 0.4],
    [2, 1, "#FFB280", 0.7],
    [3, 1, "#FFFFFF", 0.65],
    [0, 2, "#1F2937", 0.3],
    [1, 2, "#FFFFFF", 0.6],
    [2, 2, "#4C7BF0", 0.5],
    [0, 3, "#FFFFFF", 0.55],
    [1, 3, "#FFB280", 0.55],
  ];
  return (
    <svg
      viewBox="0 0 96 96"
      width="80"
      height="80"
      aria-hidden="true"
      className={className}
      style={mirrored ? { transform: "scale(-1,-1)" } : undefined}
    >
      {cells.map(([cx, cy, fill, opacity], i) => (
        <rect key={i} x={cx * 24 + 3} y={cy * 24 + 3} width="18" height="18" rx="4" fill={fill} fillOpacity={opacity} />
      ))}
    </svg>
  );
}
