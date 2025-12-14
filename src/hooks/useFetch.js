import { useEffect, useState } from 'react';
import { apiUrl } from '../api';

export default function useFetch(url, opts) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!url) {
      // No-op fetch
      setLoading(false);
      setData(null);
      setError(null);
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    fetch(apiUrl(url), opts)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          throw new Error(text || `Request failed with ${r.status}`);
        }
        return r.json();
      })
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
}
