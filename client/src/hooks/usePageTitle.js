import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | FurniMart` : 'FurniMart — Premium Furniture Marketplace';
  }, [title]);
};

export default usePageTitle;
