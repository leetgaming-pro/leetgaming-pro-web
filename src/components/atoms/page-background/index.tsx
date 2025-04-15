import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {twMerge} from "tailwind-merge";
import './styles.css';

interface PageBackgroundProps {
  url: string;
}

export default function PageBackground({url}: PageBackgroundProps) {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    const el = document.getElementById('main-content');
    if (el) {
      setElement(el);
    }
  }, []);

  if (!element) {
    return null;
  }

  return createPortal(
    <div className="page-background-image--container">
      <div style={{ backgroundImage: url }} className="page-background-image" />
    </div>
    , element
  );
}
