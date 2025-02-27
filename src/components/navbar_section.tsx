"use client"
import React, { useState, useRef, useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, Button, Avatar, Spacer } from "@nextui-org/react";
import { styled, keyframes } from '@stitches/react';
import { usePathname } from "next/navigation";
import { Kbd } from "@nextui-org/kbd"

const TestButton = styled(Button, {
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  borderRadius: "0px 0px 0 0",
  clipPath: "polygon(0% 100%, 90% 100%, 100% 50%, 100% 0, 10% 0, 0% 50%)",
});

const fadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-5px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const SubDropdown = styled(DropdownMenu, {
  minWidth: 280,
  animation: `${fadeIn} 0.2s ease`,
});

const DropdownItem = styled('a', {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 15px',
  borderRadius: '8px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#f5f5f5', // Or your preferred hover color
  },
});


const DropdownSection = ({ title, items }: any) => (
  <div>
    <text fontSize={14} fontWeight="bold" style={{ textTransform: 'uppercase' }}>{title}</text>
    <Spacer y={0.5} /> {/* Add some spacing */}
    {items.map((item: any) => (
      <DropdownItem key={item.key} href={item.href} target="_blank" rel="noopener noreferrer">
        <Avatar src={item.icon} size="sm" />
        <Spacer x={1} />
        <div>
          <text fontSize={14} fontWeight="bold">{item.label}</text>
          <text fontSize={12} style={{ color: '$accents7' }}>{item.description}</text>
        </div>
      </DropdownItem>
    ))}
  </div>
);

export default function NavBarSection() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);


  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !((dropdownRef.current as any).contains(event.target))) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); 

  const menuItems = [
    { 
      key: 'guides',
      label: 'Guides',
      description: 'Learn from the best',
      icon: '/guide-icon.png',
      href: 'https://example.com/guides',
    },
    // Add more items here
  ];

  return (
    <Dropdown isOpen={isOpen} ref={dropdownRef}>
      <DropdownTrigger>
        <TestButton title='Connect' onMouseEnter={() => setIsOpen(true)}>
          <strong>Connect</strong> <Kbd keys={["command", "enter"]} />
        </TestButton>
      </DropdownTrigger>
      <SubDropdown>
        <DropdownSection title="Esports" items={menuItems} />
      </SubDropdown>
    </Dropdown>
  );
}
