import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className=" bg-white font-sans pt-[100px] pb-24 text-[#1F1F1F]">
      <div className="max-w-6xl mx-auto ">
        <div className="mb-14 ">
          <h3 className="text-xl md:text-3xl border-b py-2 font-bold uppercase mb-6 tracking-wide mt-6 font-semi">
            PRIVACY POLICY - MULTIFOLKS
          </h3>
          <div className="text-sm md:text-base font-medium text-[#525252] space-y-2">
            <p>
              <strong>Effective Date:</strong> 27th July 2025
            </p>
            <p>
              <strong>Entity Responsible:</strong> GA Multilens Limited
              ("MultiFolks"), a company registered in England & Wales, Company
              No. 16406960, with its registered office at 2 Leman Street,
              London, E1W 9US
            </p>
          </div>
          <p className="mt-2 text-base text-[#333]  mx-auto">
            By using our website (www.multifolks.com and all subdomains, the
            "Platform") or providing us with your personal data, you agree to
            the terms of this Privacy Policy, our Terms of Use, and acknowledge
            that your data is processed under UK and EU law, not US law.
          </p>
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          {/* Just making sure headings use semi-bold and body uses book */}
          <section>
            <h2 className="text-xl font-bold uppercase mb-4 font-semi">
              1. INFORMATION WE COLLECT
            </h2>
            <p className="mb-4 text-[#333]">
              We collect and process the following categories of data when you
              use the Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                <strong>Identity Data</strong> - Name, date of birth,
                prescription details, gender ( if provided voluntarily ).
              </li>
              <li>
                <strong>Contact Data</strong> – Email, phone, billing and
                shipping addresses.
              </li>
              <li>
                <strong>Payment Data</strong> – Billing details, encrypted card
                data (processed by PCI-compliant providers).
              </li>
              <li>
                <strong>Technical Data</strong> – IP address, browser type,
                cookies, usage statistics, session logs.
              </li>
              <li>
                <strong>Health-Related Data (Optional)</strong> – Prescription
                information you upload or enter for lens customization
                (processed only to fulfill your order).
              </li>
              <li>
                <strong>Marketing Data</strong> – Preferences for newsletters,
                promotions, and advertising.
              </li>
            </ul>
            <p className="mt-4 text-[#525252]">
              We do not intentionally collect data from minors under the age of
              18. If we discover such data, it will be deleted promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              2. HOW WE USE YOUR INFORMATION
            </h2>
            <p className="mb-4 text-[#333]">
              We use your information strictly for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                <strong>Order processing and delivery</strong> of Products
                purchased through the Platform.
              </li>
              <li>
                <strong>Customer service</strong>, returns, refunds, and
                complaints resolution.
              </li>
              <li>
                <strong>Compliance with UK legal obligations</strong>, including
                tax and fraud prevention.
              </li>
              <li>
                <strong>Analytics and site improvements</strong>, via aggregated
                or anonymized data.
              </li>
              <li>
                <strong>Marketing communications</strong> (if you opt in).
              </li>
              <li>
                <strong>Cross-border shipping and customs compliance</strong>{" "}
                for international orders, including the US.
              </li>
            </ul>
            <p className="mt-4 text-[#525252]">
              We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              3. INTERNATIONAL DATA TRANSFERS (INCLUDING US CUSTOMERS)
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                All customer data is processed and stored primarily in the
                United Kingdom and European Economic Area (EEA).
              </li>
              <li>
                If you are located outside the UK (including the US), you
                consent to{" "}
                <strong>
                  the transfer of your data to the UK for processing
                </strong>
                , where privacy laws differ from those in your jurisdiction.
              </li>
              <li>
                By placing an order, US customers specifically{" "}
                <strong>
                  waive any claims under US federal or state privacy laws
                  (including CCPA, CPRA, or similar statutes)
                </strong>{" "}
                and agree that UK GDPR governs their data rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              4. LEGAL BASIS FOR PROCESSING
            </h2>
            <p className="mb-4 text-[#333]">We process your data based on:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                <strong>Contractual necessity</strong> (to process and deliver
                your orders).
              </li>
              <li>
                <strong>Legitimate interests</strong> (to improve our services
                and prevent fraud).
              </li>
              <li>
                <strong>Consent</strong> (for optional marketing and
                health-related data).
              </li>
              <li>
                <strong>Legal obligations</strong> (such as tax and accounting
                compliance).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              5. DATA RETENTION
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                Order and transaction data:{" "}
                <strong>retained for 6 years</strong> (as required by UK tax
                law).
              </li>
              <li>
                Prescription and health data:{" "}
                <strong>retained only as long as necessary</strong> to fulfill
                your order, unless you opt to store it for reorders.
              </li>
              <li>
                Marketing data:{" "}
                <strong>retained until you withdraw consent.</strong>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              6. COOKIES & TRACKING
            </h2>
            <p className="mb-4 text-[#333]">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>Enable core site functions (shopping cart, checkout).</li>
              <li>Measure site performance and traffic (Google Analytics).</li>
              <li>
                Deliver personalized ads (Meta/Facebook, Google Ads, or
                similar).
              </li>
            </ul>
            <p className="mt-4 text-[#525252]">
              You may manage or disable cookies in your browser, but certain
              features of the Platform may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              7. SHARING WITH THIRD PARTIES
            </h2>
            <p className="mb-4 text-[#333]">
              We share your personal data only with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>
                <strong>Payment processors</strong> (PCI-DSS compliant).
              </li>
              <li>
                <strong>Logistics partners</strong> (for shipping and customs
                clearance).
              </li>
              <li>
                <strong>IT service providers</strong> (for hosting, analytics,
                and email).
              </li>
              <li>
                <strong>Professional advisers</strong> (for legal or tax
                purposes).
              </li>
            </ul>
            <p className="mt-4 text-[#525252]">
              We do not authorize third parties to use your data for their own
              marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              8. YOUR RIGHTS (UNDER UK GDPR)
            </h2>
            <p className="mb-4 text-[#333]">
              Depending on your location, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#525252]">
              <li>Access your personal data.</li>
              <li>Request correction or deletion.</li>
              <li>Object to processing (including marketing).</li>
              <li>Request data portability.</li>
              <li>
                Withdraw consent at any time (without affecting prior lawful
                processing).
              </li>
            </ul>
            <p className="mt-4 text-[#525252]">
              To exercise your rights, contact us at{" "}
              <a
                href="mailto:support@multifolks.com"
                className="text-[#E94D37] font-bold"
              >
                support@multifolks.com
              </a>
              . We may verify your identity before acting on your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              9. LIMITATION OF LIABILITY FOR DATA BREACHES
            </h2>
            <p className="text-[#525252]">
              While we take appropriate technical and organizational measures to
              protect your data,{" "}
              <strong>
                we do not guarantee that the Platform or data transmissions are
                free from unauthorized access or breaches caused by third
                parties
              </strong>{" "}
              (such as hackers or internet failures).
            </p>
            <p className="mt-4 text-[#525252]">
              To the fullest extent permitted by law,{" "}
              <strong>
                MultiFolks disclaims liability for any indirect, consequential,
                or punitive damages
              </strong>{" "}
              arising from such incidents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              10. GOVERNING LAW
            </h2>
            <p className="text-[#525252]">
              This Privacy Policy is governed by the laws of England & Wales.
            </p>
            <p className="mt-2 text-[#525252]">
              Any disputes shall be resolved exclusively in the courts of
              London, UK.
            </p>
            <p className="mt-2 text-[#525252]">
              US and other non-UK customers expressly{" "}
              <strong>
                waive the right to bring claims under foreign data protection or
                privacy statutes
              </strong>
              , including class actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">
              11. UPDATES TO THIS POLICY
            </h2>
            <p className="text-[#525252]">
              We may update this Privacy Policy periodically. Continued use of
              the Platform after such changes constitutes your acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4">12. CONTACT</h2>
            <p className="text-[#525252]">
              For questions or data-related requests, contact:
            </p>
            <div className="mt-4 text-[#1F1F1F] font-medium">
              <p>MultiFolks (GA Multilens Limited)</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@multifolks.com"
                  className="text-[#E94D37]"
                >
                  support@multifolks.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
