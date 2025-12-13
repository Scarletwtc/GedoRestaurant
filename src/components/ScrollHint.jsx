import { useEffect, useState } from 'react';

export default function ScrollHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 120) setVisible(false);
      else setVisible(true);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 flex flex-col items-center animate-bounce">
      <i className="fa-solid fa-chevron-down"></i>
      <span className="text-xs mt-1">Scroll</span>
    </div>
  );
}

