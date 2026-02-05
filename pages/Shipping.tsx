import React from "react";
import { Link } from "react-router-dom";

const Shipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-[120px] pb-24 text-[#1F1F1F]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        {/* Optional Breadcrumb */}
        <div className="mb-8 hidden md:block">
          <span className="bg-[#F3F0E7] px-3 py-1 rounded text-xs font-bold text-[#1F1F1F] uppercase tracking-widest inline-flex items-center gap-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Delivery & Shipping Terms</span>
          </span>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-medium uppercase tracking-wide mb-4">
          SHIPPING POLICY – MULTIFOLKS
        </h1>

        <div className="text-sm text-[#525252] font-medium mb-8 space-y-2">
          <p>
            <strong>Effective Date:</strong> 27th July 2025
          </p>
          <p>
            <strong>Entity Responsible:</strong> GA Multilens Limited (trading
            as “MultiFolks”), a company registered in England & Wales, Company
            No. <strong>16406960</strong>, with its registered office at{" "}
            <strong>2 Leman Street, London, E1W 9US, United Kingdom.</strong>
          </p>
          <p className="pt-4">
            At MultiFolks, we make high-quality eyewear for discerning customers
            across the UK, US, and Europe — and we want your order to reach you
            as quickly and reliably as possible.
          </p>
        </div>

        <div className="space-y-12 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              1. STANDARD SHIPPING – ALWAYS FREE
            </h3>
            <p className="mb-4">
              We provide <strong>free standard delivery</strong> for all orders
              to the following regions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                <strong>United States:</strong> 7–14 working days
              </li>
              <li>
                <strong>United Kingdom:</strong> 7–10 working days
              </li>
              <li>
                <strong>European Union:</strong> 7–10 working days
              </li>
            </ul>
            <p className="mt-4 text-sm text-[#525252]">
              <strong>“Working days”</strong> exclude weekends and UK public
              holidays.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              2. EXPRESS SHIPPING – AVAILABLE AT CHECKOUT
            </h3>
            <p className="mb-4">
              For customers who need their eyewear faster, we offer{" "}
              <strong>express delivery</strong> to most serviceable locations.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                <strong>United States:</strong> 3–6 working days
              </li>
              <li>
                <strong>United Kingdom:</strong> 3–6 working days
              </li>
              <li>
                <strong>European Union:</strong> 3–6 working days
              </li>
            </ul>
            <p className="mt-4">
              Express shipping costs are <strong>calculated at checkout</strong>{" "}
              based on your country and delivery postcode. These fees are
              displayed transparently before you confirm your order.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              3. WHEN THE TIMELINE STARTS
            </h3>
            <p>
              Delivery timelines start{" "}
              <strong>
                only once we have received your complete, valid prescription
                details and your order has been cleared for production.
              </strong>{" "}
              If your prescription or order information is incomplete, our team
              will contact you to confirm details, which may delay processing.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              4. CUSTOMS & DELAYS
            </h3>
            <p className="mb-4">For customers outside the UK:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                Customs inspections or local import procedures may cause
                additional delays beyond the timelines stated above.
              </li>
              <li>
                Such delays are beyond our control and{" "}
                <strong>do not qualify as grounds for cancellation</strong> once
                the order has shipped.
              </li>
              <li>
                Any applicable customs duties, local taxes, or import fees
                remain the buyer’s responsibility.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              5. TRACKING YOUR ORDER
            </h3>
            <p>
              Once your order ships, you’ll receive a{" "}
              <strong>tracking number by email</strong> so you can monitor its
              journey.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              6. NON-DELIVERY OR DELAYS
            </h3>
            <p className="mb-4">
              We work with trusted international couriers, but sometimes factors
              outside our control (customs, weather, courier issues) can impact
              delivery.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                If your order is delayed beyond the stated timelines (excluding
                customs-related delays), our customer service team will assist
                with status updates and, where applicable, replacements under
                our Refund, Cancellation & Replacement Policy.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-4 text-[#1F1F1F]">
              7. QUESTIONS OR SUPPORT
            </h3>
            <p className="mb-2">
              For any delivery-related concerns, contact us:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@multifolks.com"
                className="text-[#E94D37] hover:underline"
              >
                support@multifolks.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
