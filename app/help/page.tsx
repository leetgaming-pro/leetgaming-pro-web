'use client';

/**
 * Help & Support Page
 * FAQ, contact form, and support resources
 */

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Accordion,
  AccordionItem,
  Divider,
  Link,
  Chip,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/config/site';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'matchmaking' | 'payments' | 'account';
}

const faqItems: FAQItem[] = [
  // General
  {
    question: 'What is LeetGaming.PRO?',
    answer: 'LeetGaming.PRO is a competitive gaming platform that offers matchmaking, tournaments, and analytics for esports enthusiasts. We support CS2 and other popular competitive games, allowing players to find matches, join tournaments, and track their performance.',
    category: 'general',
  },
  {
    question: 'How do I get started?',
    answer: 'Getting started is easy! Sign up with your Steam or Google account, complete your player profile, and you can immediately start finding matches through our matchmaking system. We recommend completing the onboarding guide for the best experience.',
    category: 'general',
  },
  {
    question: 'Is LeetGaming.PRO free to use?',
    answer: 'Yes! We offer a free tier that includes standard matchmaking, basic cloud storage (1GB), and access to community features. For advanced features like priority matchmaking, unlimited uploads, and advanced analytics, check out our Pro and Team subscription plans.',
    category: 'general',
  },
  // Matchmaking
  {
    question: 'How does matchmaking work?',
    answer: 'Our matchmaking system uses skill-based algorithms to find balanced matches. You select your region, game mode, and preferences, then join the queue. The system finds players of similar skill levels to ensure competitive and fair matches.',
    category: 'matchmaking',
  },
  {
    question: 'What regions are supported?',
    answer: 'We support multiple regions worldwide including NA-East, NA-West, EU-West, EU-East, South America, Asia, and Oceania. Choose the region closest to you for the best connection quality.',
    category: 'matchmaking',
  },
  {
    question: 'Can I play with friends?',
    answer: 'Absolutely! You can form squads and queue together for matchmaking. Create or join a squad, invite your friends, and enter the queue as a team.',
    category: 'matchmaking',
  },
  // Payments
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards (via Stripe), PayPal, and cryptocurrency (USDC/USDT on Polygon). Each payment method has different processing fees displayed during checkout.',
    category: 'payments',
  },
  {
    question: 'How do withdrawals work?',
    answer: 'You can withdraw your wallet balance to an EVM-compatible wallet address. Withdrawals are processed in USDC/USDT on the Polygon network. There is a 2% network fee for withdrawals.',
    category: 'payments',
  },
  {
    question: 'Are transactions secure?',
    answer: 'Yes, all transactions are secured using industry-standard encryption. Card payments are processed through Stripe (PCI DSS compliant), and we never store your full card details on our servers.',
    category: 'payments',
  },
  // Account
  {
    question: 'How do I change my email or password?',
    answer: 'Go to Settings > Security to update your email address or password. For security, changing your email requires verification of both old and new email addresses.',
    category: 'account',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can request account deletion from Settings > Privacy & Data. This will permanently delete all your data in compliance with GDPR/CCPA regulations. The deletion process takes 30 days to complete.',
    category: 'account',
  },
  {
    question: 'How do I enable two-factor authentication?',
    answer: 'Go to Settings > Security and enable Two-Factor Authentication. We use email-based MFA to add an extra layer of security to your account for sensitive operations.',
    category: 'account',
  },
];

const supportLinks = [
  {
    name: 'Discord Community',
    description: 'Join our Discord for real-time support',
    icon: 'simple-icons:discord',
    href: siteConfig.links.discord,
    color: 'text-[#5865F2]',
  },
  {
    name: 'Twitter / X',
    description: 'Follow us for updates and announcements',
    icon: 'simple-icons:x',
    href: siteConfig.links.twitter,
    color: 'text-foreground',
  },
  {
    name: 'GitHub',
    description: 'Report bugs and suggest features',
    icon: 'simple-icons:github',
    href: siteConfig.links.github,
    color: 'text-foreground',
  },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFAQ = selectedCategory
    ? faqItems.filter((item) => item.category === selectedCategory)
    : faqItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const categoryColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
    general: 'default',
    matchmaking: 'primary',
    payments: 'success',
    account: 'warning',
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Icon icon="solar:question-circle-bold-duotone" className="text-primary" width={40} />
          Help & Support
        </h1>
        <p className="text-default-500 mt-2 max-w-xl mx-auto">
          Find answers to common questions or get in touch with our support team
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {supportLinks.map((link) => (
          <Card
            key={link.name}
            as={Link}
            href={link.href}
            isExternal
            isPressable
            className="hover:scale-[1.02] transition-transform"
          >
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-default-100 ${link.color}`}>
                <Icon icon={link.icon} width={24} />
              </div>
              <div>
                <p className="font-semibold">{link.name}</p>
                <p className="text-sm text-default-500">{link.description}</p>
              </div>
              <Icon icon="solar:arrow-right-up-bold" className="ml-auto text-default-400" width={20} />
            </CardBody>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-col items-start gap-4 px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icon icon="solar:chat-square-like-bold" className="text-primary" width={24} />
                Frequently Asked Questions
              </h2>
              <div className="flex flex-wrap gap-2">
                <Chip
                  variant={selectedCategory === null ? 'solid' : 'flat'}
                  color="default"
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Chip>
                {['general', 'matchmaking', 'payments', 'account'].map((cat) => (
                  <Chip
                    key={cat}
                    variant={selectedCategory === cat ? 'solid' : 'flat'}
                    color={categoryColors[cat]}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Chip>
                ))}
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <Accordion variant="bordered" selectionMode="multiple">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem
                    key={index}
                    aria-label={item.question}
                    title={
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color={categoryColors[item.category]} className="capitalize">
                          {item.category}
                        </Chip>
                        <span>{item.question}</span>
                      </div>
                    }
                  >
                    <p className="text-default-600 leading-relaxed">{item.answer}</p>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icon icon="solar:letter-bold" className="text-primary" width={24} />
                Contact Us
              </h2>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <Icon icon="solar:check-circle-bold" className="text-success mx-auto" width={64} />
                  <h3 className="text-lg font-semibold mt-4">Message Sent!</h3>
                  <p className="text-default-500 mt-2">
                    We&apos;ll get back to you as soon as possible.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    value={formData.name}
                    onValueChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                    startContent={<Icon icon="solar:user-bold" className="text-default-400" width={18} />}
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onValueChange={(value) => setFormData({ ...formData, email: value })}
                    isRequired
                    startContent={<Icon icon="solar:letter-bold" className="text-default-400" width={18} />}
                  />
                  <Input
                    label="Subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    isRequired
                    startContent={<Icon icon="solar:chat-line-bold" className="text-default-400" width={18} />}
                  />
                  <Textarea
                    label="Message"
                    placeholder="Describe your issue or question..."
                    value={formData.message}
                    onValueChange={(value) => setFormData({ ...formData, message: value })}
                    isRequired
                    minRows={4}
                  />
                  <Button
                    type="submit"
                    color="primary"
                    fullWidth
                    isLoading={isSubmitting}
                    startContent={!isSubmitting && <Icon icon="solar:plain-bold" width={18} />}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}

              <Divider className="my-6" />

              <div className="text-center text-sm text-default-500">
                <p>Or email us directly at:</p>
                <Link href="mailto:support@leetgaming.pro" className="text-primary font-medium">
                  support@leetgaming.pro
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Additional Resources */}
          <Card className="mt-4">
            <CardBody className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon icon="solar:document-bold" className="text-default-500" width={20} />
                Documentation
              </h3>
              <div className="space-y-2">
                <Button
                  as={Link}
                  href="/docs"
                  variant="flat"
                  fullWidth
                  className="justify-start"
                  startContent={<Icon icon="solar:book-2-bold" width={18} />}
                >
                  Getting Started Guide
                </Button>
                <Button
                  as={Link}
                  href="/onboarding"
                  variant="flat"
                  fullWidth
                  className="justify-start"
                  startContent={<Icon icon="solar:star-bold" width={18} />}
                >
                  Onboarding Tutorial
                </Button>
                <Button
                  as={Link}
                  href={siteConfig.links.tech}
                  isExternal
                  variant="flat"
                  fullWidth
                  className="justify-start"
                  startContent={<Icon icon="solar:code-bold" width={18} />}
                >
                  Developer Docs
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
