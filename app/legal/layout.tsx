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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="bg-content1/50 border border-content3">
        <CardBody className="p-8 md:p-12">
          {children}
          <div className="mt-12 pt-8 border-t border-divider">
            <h3 className="text-sm font-semibold mb-3">Related Legal Documents</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/legal/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link href="/legal/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
