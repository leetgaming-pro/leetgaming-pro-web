"use client"
import { logo } from '@/components/primitives';
import { Button, Kbd } from '@nextui-org/react';
import { styled } from '@stitches/react';
import { useTheme } from 'next-themes';

const BattleButton = styled(Button, {
  position: 'relative', // Essential for pseudo-element positioning
  overflow: 'hidden',   // Hide the pseudo-element's overflow
  transition: 'background 0.3s ease', // Smooth transition
  borderWidth: "4px",
  borderStyle: "solid",
  borderRadius: "25px",
  
  // clipPath: "polygon(0% 100%, 90% 100%, 100% 50%, 100% 0, 10% 0, 0% 50%);", /* Inverted hexagon */

  '&::before': { // The pseudo-element that creates the fill effect
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    width: '0%', // Starts at 0% height
    // background: 'linear-gradient(to top, rgb(0, 183, 250), rgb(111, 238, 141))',
    background: 'linear-gradient(to top, #FF4654, #FFC700)',
    zIndex: -1,    // Place it behind the button content
    transition: 'width 0.3s ease', // Smooth transition
  },

  '&:hover::before': {
    width: '100%', // Fill the entire button on hover
  },
  
});

// AltairOrgange: #FF4654, AltairYellow: #FFC700
// linear-gradient(rgb(255, 199, 0) 0%, rgb(255, 70, 84) 100%)

const App = (props: any) => { 
  const { theme, setTheme } = useTheme();

  return (
  
  <div>
    <BattleButton className="px-4 h-12 font-medium"
      style={{
        borderColor: "#DCFF37", // offwhite: '#F2F2F2', neon-lime: '#DCFF37', neon-cyan: '#00B3FF', yellow-orange: 'FFC700', pink-orange: 'FF4654', navy-blue: "#34445C"
        backgroundColor: theme === 'dark' ? '#34445C' : '#F2F2F2',
      }}
      {...props} />
  </div>
);}

export default App;
