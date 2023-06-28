import { useEffect, useRef } from 'react';

export default function useIsMount() {
  const isMount = useRef(false);

  useEffect(() => {
    isMount.current = true;

    return () => {
      isMount.current = false;
    };
  }, []);

  return isMount;
}
