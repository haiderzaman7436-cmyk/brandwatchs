import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Privacy Policy
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
            1. Information We Collect
          </h2>
          <p>
            We collect basic account details such as your email address and
            order information to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used to process orders, improve your shopping
            experience, and communicate important updates.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            3. Data Protection
          </h2>
          <p>
            We implement appropriate security measures to protect your personal
            information and do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            4. Third-Party Services
          </h2>
          <p>
            Trusted service providers may assist in operating our platform.
            These partners are required to handle your data responsibly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            5. Your Rights
          </h2>
          <p>
            You may update or request deletion of your account information by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Contact
          </h2>
          <p>
            For privacy-related inquiries, contact us at{" "}
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

export default Privacy;