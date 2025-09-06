import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
            <p className="text-gray-600">Effective Date: January 1, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using NestProtect ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p>
                NestProtect is a disaster preparedness and resource location application that provides:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Weather alerts and monitoring</li>
                <li>Emergency preparedness guidance</li>
                <li>Local resource mapping</li>
                <li>Government alerts and notifications</li>
                <li>Document storage and management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <p>Users agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate and current information</li>
                <li>Use the service for lawful purposes only</li>
                <li>Not interfere with or disrupt the service</li>
                <li>Maintain the security of their account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Emergency Disclaimer</h2>
              <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Important:</strong> NestProtect is not a replacement for official emergency services. 
                In case of immediate emergency, always call 911 or your local emergency services first. 
                The information provided through this service is for preparedness and informational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Accuracy</h2>
              <p>
                While we strive to provide accurate and up-to-date information, NestProtect makes no warranties about the completeness, 
                reliability, or accuracy of weather data, resource locations, or emergency information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
              <p>
                NestProtect and its operators shall not be liable for any damages arising from the use or inability to use the service, 
                including but not limited to damages resulting from reliance on information provided by the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Account Termination</h2>
              <p>
                We reserve the right to terminate or suspend accounts that violate these terms or engage in inappropriate behavior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us through the app's support feature.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;