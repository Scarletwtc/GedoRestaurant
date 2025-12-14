import Hero from '../components/Hero';
import Welcome from '../components/Welcome';
import SignatureDishes from '../components/SignatureDishes';
import TodaysSpecial from '../components/TodaysSpecial';
import Testimonials from '../components/Testimonials';
import Reservation from '../components/Reservation';
import SectionDivider from '../components/SectionDivider';
import Gallery from '../components/Gallery';

export default function Home() {
  return (
    <>
      <Hero />
      <Welcome />
      <SectionDivider />
      <SignatureDishes />
      <SectionDivider />
      <TodaysSpecial />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <Reservation />
      <SectionDivider />
      <Gallery />
    </>
  );
}
