import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600">Effective Date: January 1, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>
                NestProtect collects the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Location Data:</strong> GPS coordinates to provide local weather alerts and nearby resources</li>
                <li><strong>Account Information:</strong> Email address and profile information for authentication</li>
                <li><strong>Usage Data:</strong> How you interact with the app to improve our services</li>
                <li><strong>Document Data:</strong> Emergency documents you choose to store in the app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide personalized weather alerts and emergency notifications</li>
                <li>Show relevant local resources and services</li>
                <li>Maintain and improve app functionality</li>
                <li>Secure your account and documents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements or protect rights and safety</li>
                <li>With service providers who help us operate the app (under strict confidentiality agreements)</li>
                <li>In case of business transfer (merger, acquisition, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Location Data</h2>
              <p className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <strong>Location Privacy:</strong> Your location data is used solely to provide relevant emergency information 
                and resources. We do not track your movements or store location history. Location data is processed 
                in real-time to deliver location-specific alerts and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and review your personal information</li>
                <li>Correct or update your information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p>
                We retain your information only as long as necessary to provide services or as required by law. 
                When you delete your account, we will permanently delete your personal information within 30 days, 
                except where retention is required for legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p>
                NestProtect is not intended for children under 13. We do not knowingly collect personal information 
                from children under 13. If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of significant changes 
                through the app or via email. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p>
                For questions about this privacy policy or to exercise your rights, please contact us through 
                the app's support feature or the contact information provided in the app.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;