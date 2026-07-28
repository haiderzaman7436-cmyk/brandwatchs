import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImageSlider = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="bg-muted h-full w-full" />;
  }

  const prev = (e: any) => {
    e.preventDefault();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = (e: any) => {
    e.preventDefault();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">

      <img
        src={images[index]}
        alt=""
        className="object-contain w-full h-full"
      />

      {images.length > 1 && (
        <>
          {/* LEFT */}
          <button
            onClick={prev}
            className="absolute left-2 bg-brand-cards/80 p-1 rounded-full shadow"
          >
            <ChevronLeft size={18} />
          </button>

          {/* RIGHT */}
          <button
            onClick={next}
            className="absolute right-2 bg-brand-cards/80 p-1 rounded-full shadow"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </div>
  );
};

export default ProductImageSlider;