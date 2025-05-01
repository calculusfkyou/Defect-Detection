import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' // 使用 'instant' 而非 'smooth' 避免視覺延遲
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
