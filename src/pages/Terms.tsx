import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: February 25, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14 space-y-10 text-sm leading-relaxed text-muted-foreground">

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            1. Overview
          </h2>
          <p>
            Welcome to Brand Watches. By accessing or using our website,
            you agree to comply with these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            2. Your Account
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities under your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            3. Orders & Payments
          </h2>
          <p>
            Prices and product availability may change without notice.
            We reserve the right to cancel orders in case of errors
            or suspicious activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            4. Returns
          </h2>
          <p>
            Return and refund policies, if applicable, are displayed at checkout
            or on product pages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            5. Acceptable Use
          </h2>
          <p>
            You agree not to misuse the website or attempt unauthorized access
            to accounts, systems, or data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            6. Updates
          </h2>
          <p>
            We may update these Terms periodically. Continued use of the
            website indicates your acceptance of any updates.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Contact
          </h2>
          <p>
            For any questions regarding these Terms, please contact us at{" "}
            <span className="text-foreground font-medium">
              support@brandwatches.com
            </span>
          </p>
        </section>

        <div className="pt-10 border-t text-center">
          <Link
            to="/"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;