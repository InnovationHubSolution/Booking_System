import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-8">Last Updated: December 29, 2025</p>

                <div className="space-y-8 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using the Vanuatu Booking System website and services, you accept and agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                        <p>
                            Vanuatu Booking System provides an online platform for booking accommodations, flights, car rentals, tours, and other travel services
                            in Vanuatu. We act as an intermediary between you and the service providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must be at least 18 years old to create an account</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You are responsible for all activities that occur under your account</li>
                            <li>You must provide accurate, current, and complete information</li>
                            <li>You must notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Bookings and Payments</h2>
                        <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Making Bookings</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All bookings are subject to availability</li>
                            <li>Prices are displayed in the currency selected and are subject to change</li>
                            <li>You must provide accurate booking information</li>
                            <li>Booking confirmation is sent via email</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Payment Terms</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Payment is required at the time of booking unless otherwise specified</li>
                            <li>We accept major credit cards, PayPal, and other payment methods</li>
                            <li>All payments are processed securely through third-party payment processors</li>
                            <li>Prices include applicable taxes unless stated otherwise</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancellation and Refund Policy</h2>
                        <p className="mb-3">Cancellation policies vary by service provider and booking type:</p>

                        <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Accommodations</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Flexible:</strong> Free cancellation up to 24 hours before check-in</li>
                            <li><strong>Moderate:</strong> Free cancellation up to 7 days before check-in</li>
                            <li><strong>Strict:</strong> 50% refund if cancelled 14+ days before check-in</li>
                            <li><strong>Non-refundable:</strong> No refunds for cancellations</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Flights</h3>
                        <p>Subject to airline policies. Change and cancellation fees may apply.</p>

                        <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Other Services</h3>
                        <p>Cancellation policies are specified at the time of booking.</p>

                        <p className="mt-4">
                            Refunds are processed within 5-10 business days to the original payment method.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
                        <p className="mb-3">You agree NOT to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Use the service for any illegal purpose</li>
                            <li>Make fraudulent bookings</li>
                            <li>Provide false information</li>
                            <li>Interfere with the proper working of the service</li>
                            <li>Attempt to gain unauthorized access to any portion of the service</li>
                            <li>Use the service to harm, threaten, or harass others</li>
                            <li>Upload malicious code or viruses</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                        <p>
                            All content on this website, including text, graphics, logos, images, and software, is the property of Vanuatu Booking System
                            or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works
                            without our explicit written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Liability Disclaimer</h2>
                        <p className="mb-3">
                            Vanuatu Booking System acts as an intermediary and is not responsible for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>The quality, safety, or legality of services provided by third parties</li>
                            <li>The truth or accuracy of listings and descriptions</li>
                            <li>The ability of service providers to deliver booked services</li>
                            <li>Acts of God, natural disasters, or unforeseen circumstances</li>
                            <li>Personal injury or property damage during travel</li>
                        </ul>
                        <p className="mt-3 font-semibold">
                            Use of our services is at your own risk. We provide the service "as is" without warranties of any kind.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Vanuatu Booking System shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
                            or any loss of data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless Vanuatu Booking System, its affiliates, and their respective officers, directors,
                            employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the service
                            or violation of these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modifications to Service</h2>
                        <p>
                            We reserve the right to modify or discontinue the service at any time, with or without notice.
                            We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
                        <p>
                            These Terms of Service shall be governed by and construed in accordance with the laws of Vanuatu,
                            without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
                        <p>
                            Any disputes arising from these terms or use of our service shall be resolved through binding arbitration in Vanuatu.
                            You waive the right to participate in class action lawsuits.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
                        <p>
                            We reserve the right to update these Terms of Service at any time.
                            We will notify users of material changes by email or through a notice on our website.
                            Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
                        <p>For questions about these Terms of Service, please contact us:</p>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p><strong>Email:</strong> legal@vanuatubooking.com</p>
                            <p><strong>Phone:</strong> +678 123 4567</p>
                            <p><strong>Address:</strong> Port Vila, Vanuatu</p>
                        </div>
                    </section>

                    <section className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <p className="font-semibold text-gray-900">
                            By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
