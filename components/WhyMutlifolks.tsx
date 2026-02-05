import { Truck, Target, Lock } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

const FeatureCard = ({ icon: Icon, title, subtitle }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#CCE4E4] bg-white transition-transform duration-300 hover:scale-110">
        <Icon className="h-6 w-6 text-[#025048]" strokeWidth={2} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold text-[#025048] leading-tight">{title}</p>
        {subtitle && (
          <p className="text-[11px] font-bold text-[#025048] leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
};





const WhyMultifolks = () => {
  const features = [
    {
      icon: Truck,
      title: "Guaranteed",
      subtitle: "Fast Delivery",
    },
    {
      icon: Target,
      title: "Full Money",
      subtitle: "Back Guarantee",
    },
    {
      icon: Lock,
      title: "Secure",
      subtitle: "Payment & Checkout",
    },
  ];

  return (
    <section className="w-full bg-[#E0F2F2] p-5 rounded-xl border border-[#CCE4E4] shadow-sm">
      <h2 className="mb-6 text-base font-bold text-[#025048]">
        Why Multifolks?
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyMultifolks;
