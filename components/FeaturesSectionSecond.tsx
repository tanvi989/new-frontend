import React from "react";

interface CardProps {
  iconSrc: string;
  heading: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<CardProps> = ({
  iconSrc,
  heading,
  description,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm flex-1 ${className}`}
  >
    <div className="flex flex-row items-center justify-between">
      <h3
        style={{
          color: '#232320',
          fontSize: '28px',
          fontFamily: 'Lynstone-regular, sans-serif',
          fontWeight: 400,
          wordWrap: 'break-word'
        }}
        className="mb-3"
      >
        {heading}
      </h3>
      <img
        src={iconSrc}
        alt={heading}
        className="w-12 h-12 mb-4" // Adjust size as needed
      />
    </div>
    <p
      style={{
        color: '#232320',
        fontSize: '16px',
        fontFamily: 'Lynstone-regular, sans-serif',
        fontWeight: 350,
        wordWrap: 'break-word'
      }}
      className="leading-relaxed text-start"
    >
      {description}
    </p>
  </div>
);

const FeaturesSectionSecond: React.FC = () => {
  return (
    <div className="w-full bg-yellow-300 py-12 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Heading */}
        <FeatureCard
          iconSrc="/Frame 5.png" // Replace with actual PNG path
          heading="Affordable"
          description="Our multifocals are up to 50% cheaper than traditional in-store opticians. We don't compromise quality."
        />

        {/* Card 2: 30-day refunds */}
        <FeatureCard
          iconSrc="/Frame 3.png" // Replace with actual PNG path (circular 30)
          heading="30-day refunds"
          description="Not sitting right on your nose? We'll refund your lenses as well as frames."
        />

        {/* Card 3: 24/7 support */}
        <FeatureCard
          iconSrc="/Frame 6.png" // Replace with actual PNG path (handshake)
          heading="24/7 support"
          description="Including our team of real humans available on email support@multifocals.com"
        />

        {/* Card 4: HSA/FSA eligible */}
        <FeatureCard
          iconSrc="/Frame 4.png" // Replace with actual PNG path (checkmark)
          heading="HSA/FSA eligible"
          description="Use your benefits; we accept HSA/FSA insurance."
        />
      </div>
    </div>
  );
};

export default FeaturesSectionSecond;
