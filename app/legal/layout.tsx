'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-12 md:py-16 lg:py-20">
      <Card className="bg-content1/50 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-none">
        <CardBody className="p-6 md:p-8 lg:p-12 xl:p-16">
          {children}
          <div className="mt-12 lg:mt-16 pt-8 lg:pt-10 border-t border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <h3 className="text-sm lg:text-base font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">Related Legal Documents</h3>
            <div className="flex flex-wrap gap-4 lg:gap-6 text-sm lg:text-base">
              <Link href="/legal/terms" className="text-[#FF4654] dark:text-[#DCFF37] hover:underline transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-[#FF4654] dark:text-[#DCFF37] hover:underline transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cookies" className="text-[#FF4654] dark:text-[#DCFF37] hover:underline transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
