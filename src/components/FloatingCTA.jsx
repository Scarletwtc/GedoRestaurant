import { phone } from '../data';
import useFetch from '../hooks/useFetch';

export default function FloatingCTA() {
  const { data: site } = useFetch('/api/site');
  const tel = site?.contactPhone || phone;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-40">
      <a
        href={`tel:${tel}`}
        className="px-5 py-3 rounded-full bg-gedo-gold text-white shadow-hover hover:shadow-lg transition flex items-center gap-2"
      >
        <i className="fa-solid fa-phone"></i>
        <span className="hidden md:inline">Call Us</span>
        <span className="md:hidden">Call</span>
      </a>
    </div>
  );
}

