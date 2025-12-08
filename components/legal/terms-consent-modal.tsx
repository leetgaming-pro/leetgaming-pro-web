'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Link,
  Divider,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { EsportsButton } from '@/components/ui/esports-button';

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  cookies: boolean;
  marketing: boolean;
  analytics: boolean;
  age: boolean;
}

interface TermsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (consent: ConsentState) => void;
  requireAge?: boolean;
  ageRequirement?: number;
  region?: string;
}

export function TermsConsentModal({
  isOpen,
  onClose,
  onAccept,
  requireAge = true,
  ageRequirement = 13,
  region = 'US',
}: TermsConsentModalProps) {
  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    cookies: false,
    marketing: false,
    analytics: false,
    age: false,
  });

  const [canProceed, setCanProceed] = useState(false);

  // Check if required consents are given
  useEffect(() => {
    const hasRequired = consent.terms && consent.privacy && consent.cookies && (requireAge ? consent.age : true);
    setCanProceed(hasRequired);
  }, [consent, requireAge]);

  const handleAcceptAll = () => {
    const fullConsent: ConsentState = {
      terms: true,
      privacy: true,
      cookies: true,
      marketing: true,
      analytics: true,
      age: true,
    };
    setConsent(fullConsent);
    onAccept(fullConsent);
    onClose();
  };

  const handleAcceptRequired = () => {
    if (!canProceed) return;
    onAccept(consent);
    onClose();
  };

  const getAgeMessage = () => {
    if (region === 'EU' || region === 'UK') {
      return `I confirm that I am at least ${Math.max(ageRequirement, 16)} years old (GDPR requirement)`;
    }
    if (region === 'KR') {
      return `I confirm that I am at least 14 years old (Korean requirement)`;
    }
    return `I confirm that I am at least ${ageRequirement} years old`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
        header: "border-b border-default-200 dark:border-[#DCFF37]/20",
        body: "py-6",
        footer: "border-t border-default-200 dark:border-[#DCFF37]/20",
      }}
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
              <Icon icon="solar:shield-check-bold" className="text-white dark:text-[#1a1a1a]" width={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#34445C] dark:text-white">Welcome to LeetGaming.PRO</h2>
              <p className="text-sm text-default-500">Please review and accept our terms to continue</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Required Consents */}
          <div className="space-y-4">
            <div className="p-4 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
              <p className="text-sm font-semibold text-[#FF4654] dark:text-[#DCFF37] mb-1">Required</p>
              <p className="text-xs text-default-500">These agreements are required to use LeetGaming.PRO</p>
            </div>

            <Checkbox
              isSelected={consent.terms}
              onValueChange={(v) => setConsent(prev => ({ ...prev, terms: v }))}
              classNames={{
                base: "max-w-full p-3 border border-default-200 dark:border-[#DCFF37]/20 rounded-none hover:bg-default-100 dark:hover:bg-[#DCFF37]/5 data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
                wrapper: "before:border-[#FF4654] dark:before:border-[#DCFF37] after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">Terms of Service</span>
                <span className="text-xs text-default-500">
                  I have read and agree to the{' '}
                  <Link href="/legal/terms" target="_blank" className="text-[#FF4654] dark:text-[#DCFF37]">
                    Terms of Service
                  </Link>
                </span>
              </div>
            </Checkbox>

            <Checkbox
              isSelected={consent.privacy}
              onValueChange={(v) => setConsent(prev => ({ ...prev, privacy: v }))}
              classNames={{
                base: "max-w-full p-3 border border-default-200 dark:border-[#DCFF37]/20 rounded-none hover:bg-default-100 dark:hover:bg-[#DCFF37]/5 data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
                wrapper: "before:border-[#FF4654] dark:before:border-[#DCFF37] after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">Privacy Policy</span>
                <span className="text-xs text-default-500">
                  I have read and understand the{' '}
                  <Link href="/legal/privacy" target="_blank" className="text-[#FF4654] dark:text-[#DCFF37]">
                    Privacy Policy
                  </Link>
                </span>
              </div>
            </Checkbox>

            <Checkbox
              isSelected={consent.cookies}
              onValueChange={(v) => setConsent(prev => ({ ...prev, cookies: v }))}
              classNames={{
                base: "max-w-full p-3 border border-default-200 dark:border-[#DCFF37]/20 rounded-none hover:bg-default-100 dark:hover:bg-[#DCFF37]/5 data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
                wrapper: "before:border-[#FF4654] dark:before:border-[#DCFF37] after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">Cookie Policy</span>
                <span className="text-xs text-default-500">
                  I accept the use of essential cookies as described in the{' '}
                  <Link href="/legal/cookies" target="_blank" className="text-[#FF4654] dark:text-[#DCFF37]">
                    Cookie Policy
                  </Link>
                </span>
              </div>
            </Checkbox>

            {requireAge && (
              <Checkbox
                isSelected={consent.age}
                onValueChange={(v) => setConsent(prev => ({ ...prev, age: v }))}
                classNames={{
                  base: "max-w-full p-3 border border-default-200 dark:border-[#DCFF37]/20 rounded-none hover:bg-default-100 dark:hover:bg-[#DCFF37]/5 data-[selected=true]:border-[#FF4654] dark:data-[selected=true]:border-[#DCFF37]",
                  wrapper: "before:border-[#FF4654] dark:before:border-[#DCFF37] after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Age Verification</span>
                  <span className="text-xs text-default-500">{getAgeMessage()}</span>
                </div>
              </Checkbox>
            )}
          </div>

          <Divider className="my-6" />

          {/* Optional Consents */}
          <div className="space-y-4">
            <div className="p-4 bg-default-100 dark:bg-[#111111] rounded-none">
              <p className="text-sm font-semibold text-default-700 dark:text-default-300 mb-1">Optional</p>
              <p className="text-xs text-default-500">These help us improve your experience (you can change these later)</p>
            </div>

            <Checkbox
              isSelected={consent.analytics}
              onValueChange={(v) => setConsent(prev => ({ ...prev, analytics: v }))}
              classNames={{
                base: "max-w-full p-3 border border-default-200 dark:border-default-700 rounded-none hover:bg-default-100 dark:hover:bg-default-800/50",
                wrapper: "before:border-default-400 after:bg-default-500",
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">Analytics</span>
                <span className="text-xs text-default-500">
                  Allow us to collect anonymized usage data to improve the platform
                </span>
              </div>
            </Checkbox>

            <Checkbox
              isSelected={consent.marketing}
              onValueChange={(v) => setConsent(prev => ({ ...prev, marketing: v }))}
              classNames={{
                base: "max-w-full p-3 border border-default-200 dark:border-default-700 rounded-none hover:bg-default-100 dark:hover:bg-default-800/50",
                wrapper: "before:border-default-400 after:bg-default-500",
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">Marketing Communications</span>
                <span className="text-xs text-default-500">
                  Receive news about tournaments, features, and promotions
                </span>
              </div>
            </Checkbox>
          </div>
        </ModalBody>

        <ModalFooter className="flex-col sm:flex-row gap-3">
          <EsportsButton
            variant="ghost"
            size="md"
            className="w-full sm:w-auto"
            onClick={handleAcceptRequired}
            disabled={!canProceed}
          >
            Accept Required Only
          </EsportsButton>
          <EsportsButton
            variant="action"
            size="md"
            className="w-full sm:w-auto"
            onClick={handleAcceptAll}
          >
            <Icon icon="solar:check-circle-bold" width={18} />
            Accept All & Continue
          </EsportsButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TermsConsentModal;

