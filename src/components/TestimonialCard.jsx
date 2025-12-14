import { motion } from 'framer-motion';

export default function TestimonialCard({ testimonial }) {
  const fullStars = Math.floor(testimonial.stars);
  const halfStar = testimonial.stars - fullStars >= 0.5;

  return (
    <motion.div
      id={`testimonial-${testimonial.id}`}
      className="bg-white rounded-xl p-6 shadow-card relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-4 left-6 text-gedo-gold text-4xl">
        <i className="fa-solid fa-quote-left"></i>
      </div>
      <div className="pt-6">
        <p className="text-gedo-brown mb-6">{testimonial.quote}</p>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium text-gedo-green">{testimonial.name}</h4>
            <div className="flex text-gedo-gold text-sm">
              {Array.from({ length: fullStars }).map((_, idx) => (
                <i key={idx} className="fa-solid fa-star"></i>
              ))}
              {halfStar && <i className="fa-solid fa-star-half-alt"></i>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
