import React from "react";
import { Link } from "react-router-dom";

const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans pt-[120px] pb-12 ">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Optional Breadcrumb */}

        <h3 className="text-xl border-b md:text-2xl py-2 text-[#525252] font-medium uppercase tracking-wide mb-4">
          TERMS OF USE - MULTIFOLKS PLATFORM
        </h3>

        <div className="text-md  font-medium mb-6 space-y-2">
          <p>
            <strong>Effective Date:</strong> 27th July 2025
          </p>
          <p>
            <strong>Governing Entity:</strong> GA Multilens Limited (trading as
            “Multifolks”), a company incorporated and registered under the laws
            of England & Wales with its registered office at 2 Leman Street,
            London, EIW 9US, Company No. 16406960.
          </p>
        </div>

        <div className="space-y-6 text-[#333] text-base font-medium leading-relaxed border-gray-200 pb-8 mb-8">
          <section>
            <h3 className="text-lg font-bold uppercase mb-1">
              LEGAL NATURE OF THIS DOCUMENT
            </h3>
            <p className="mb-1">
              This Terms of Use (“Agreement”) is a legally binding contract
              between you (“Buyer”, “You”, “Your”) and GA Multilens Limited
              (“Company”, “We”, “Our”, “Us”) governing your access to and use of
              our website and digital services (the “Platform”), including the
              purchase of eyewear products (“Products”).
            </p>
            <p className="mb-1">
              By continuing to browse or placing an order through the Platform,
              you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                You are contracting{" "}
                <strong className="text-black">
                  solely with GA Multilens Limited, a UK-registered company
                </strong>
                , and any orders are processed and fulfilled from the UK.
              </li>
              <li>
                <strong>
                  Your purchase is deemed to occur in the United Kingdom
                </strong>
                , and English law (and any applicable EU/UK regulations) shall
                exclusively govern your transaction, irrespective of your place
                of residence.
              </li>
              <li>
                US customers specifically acknowledge that{" "}
                <strong className="text-black">
                  US federal and state consumer protection statutes, sales tax
                  laws, and class action mechanisms do not apply to their
                  transactions
                </strong>
                , as this is a cross-border e-commerce sale governed solely by
                UK law.
              </li>
            </ul>
            <p className="mt-1">
              If you do not agree with these Terms, you must not use the
              Platform or purchase any Products.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#525252]">
              DEFINITIONS
            </h3>
            <p className="mb-1">For purposes of this Agreement:</p>
            <ul className="list-disc pl-5 space-y-2 ">
              <li>
                <strong>“Applicable Law”</strong> means all laws and regulations
                applicable in England & Wales and, where relevant, the EU.
              </li>
              <li>
                <strong>“Platform”</strong> means www.multifolks.com (and any
                subdomains such as .com/us, .com/uk), our mobile applications,
                and any future successor sites.
              </li>
              <li>
                <strong>“Buyer Account”</strong> means the electronic profile
                you create to place and track orders.
              </li>
              <li>
                <strong>“Products”</strong> means all eyewear products offered
                by us, including prescription glasses, sunglasses, multifocal
                lenses, coatings, and accessories.
              </li>
              <li>
                <strong>“Transaction”</strong> means any purchase order placed
                by you on the Platform.
              </li>
              <li>
                <strong>“Chargeback”</strong> means any disputed transaction,
                subject solely to the Company’s refund and cancellation
                policies.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#525252]">
              SCOPE OF THE PLATFORM
            </h3>
            <p className="mb-1">
              The Platform is an e-commerce portal where Buyers can browse,
              customize, and purchase Products. By placing an order, you agree
              to:
            </p>
            <ul className="list-disc pl-5 space-y-2 ">
              <li>
                Pay the prices, shipping costs, and any duties/customs
                applicable to your delivery destination (prices are displayed in
                your local currency but billed through our UK entity).
              </li>
              <li>
                Be bound by our{" "}
                <strong>Refund, Cancellation, and Chargeback Policy</strong>,
                available at{" "}
                <a
                  href="/return-policy"
                  className="text-[#009FE3] hover:underline"
                >
                  www.multifolks.com/refundpolicy/
                </a>
              </li>
              <li>
                Accept that{" "}
                <strong>
                  MultiFolks does not guarantee delivery timelines
                </strong>{" "}
                due to third-party carrier dependencies, customs clearances, or
                Force Majeure events.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#525252]">
              CROSS-BORDER PURCHASES (IMPORTANT FOR US CUSTOMERS)
            </h3>
            <p className="mb-1">
              All orders placed by US-based customers are deemed{" "}
              <strong>cross-border international transactions</strong> with the
              following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 ">
              <li>
                Title and risk transfer to you once the Products leave our UK
                fulfillment center.
              </li>
              <li>
                MultiFolks is{" "}
                <strong>
                  not responsible for local taxes, import duties, customs
                  delays, or any requirements under US federal or state law.
                </strong>
              </li>
              <li>
                US customers agree that any disputes shall be resolved{" "}
                <strong>exclusively in English courts</strong> and waive any
                right to initiate or participate in US-based class actions or
                regulatory complaints against MultiFolks.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#525252]">
              BUYER RESPONSIBILITIES
            </h3>
            <p className="mb-1">By using the Platform, you agree that:</p>
            <ul className="list-disc pl-5 space-y-2 ">
              <li>
                You are at least 18 years old (or of legal age in your
                jurisdiction).
              </li>
              <li>
                You hold a valid optical prescription (where applicable) and the
                information you provide is accurate.
              </li>
              <li>
                Any errors in address, prescription, or payment details are your
                responsibility, and <strong>redelivery or rework fees</strong>{" "}
                may apply.
              </li>
              <li>
                You will comply with all Applicable Law in your jurisdiction
                regarding importation and use of the Products.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              LIMITATION OF LIABILITY
            </h3>
            <p className="mb-1">To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-5 space-y-2 ">
              <li>
                MultiFolks, its affiliates, employees, or agents shall{" "}
                <strong>
                  not be liable for any indirect, incidental, consequential,
                  punitive, or exemplary damages
                </strong>
                , including loss of profits, data, goodwill, or delays, even if
                advised of the possibility of such damages.
              </li>
              <li>
                Our total cumulative liability for any claim, whether in
                contract, tort, or otherwise, shall{" "}
                <strong>
                  not exceed the total amount you paid for the Product giving
                  rise to the claim.
                </strong>
              </li>
              <li>
                We expressly disclaim liability for any third-party actions,
                including payment gateways, couriers, customs, or technical
                failures beyond our control.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              GOVERNING LAW AND JURISDICTION
            </h3>
            <p className="mb-1">
              This Agreement, and any disputes arising from it, shall be
              governed by the laws of England & Wales.{" "}
              <strong>
                The courts of London, United Kingdom, shall have exclusive
                jurisdiction.
              </strong>
            </p>
            <p>
              By placing an order, you agree that{" "}
              <strong>
                US federal and state consumer statutes do not apply
              </strong>
              , as this is a cross-border purchase from the UK.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              FORCE MAJEURE
            </h3>
            <p className="mb-1">
              We shall not be liable for any failure or delay caused by
              circumstances beyond our reasonable control, including natural
              disasters, strikes, government actions, pandemics, technology
              failures, or customs-related delays.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              TERMINATION
            </h3>
            <p className="mb-1">
              We reserve the right to suspend or terminate your access to the
              Platform at any time, without notice, for violation of these Terms
              or any illegal or fraudulent activity.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              ENTIRE AGREEMENT
            </h3>
            <p className="">
              These Terms, together with our Privacy Policy at{" "}
              <a
                href="/privacy-policy"
                className="text-[#E94D37] hover:underline"
              >
                www.multifolks.com/privacypolicy
              </a>{" "}
              and Refund & Cancellation Policy at{" "}
              <a
                href="/return-policy"
                className="text-[#E94D37] hover:underline"
              >
                www.multifolks.com/refundpolicy
              </a>{" "}
              constitute the entire agreement between you and MultiFolks,
              superseding all prior communications or agreements.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase mb-1 text-[#1F1F1F]">
              CONTACT
            </h3>
            <p className="mb-1">For questions or grievances, contact:</p>
            <p>
              <strong>MultiFolks (GA Multilens Limited)</strong>
            </p>
            <p>
              Email:{" "}
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

export default TermsOfUse;
