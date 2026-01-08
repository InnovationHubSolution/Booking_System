import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-8">Last Updated: December 29, 2025</p>

                <div className="space-y-8 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Vanuatu Booking System. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we look after your personal data when you visit our website or use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                        <p className="mb-3">We collect and process the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, postal address</li>
                            <li><strong>Account Data:</strong> Username, password (encrypted), and account preferences</li>
                            <li><strong>Booking Information:</strong> Travel dates, accommodation preferences, payment information</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
                            <li><strong>Usage Data:</strong> How you use our website and services</li>
                            <li><strong>Payment Data:</strong> Payment card details (securely processed by third-party providers)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                        <p className="mb-3">We use your personal data for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To process your bookings and provide travel services</li>
                            <li>To communicate with you about your reservations</li>
                            <li>To send booking confirmations and updates</li>
                            <li>To improve our website and services</li>
                            <li>To send marketing communications (with your consent)</li>
                            <li>To comply with legal obligations</li>
                            <li>To prevent fraud and ensure security</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                        <p className="mb-3">We may share your personal data with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Hotels, airlines, and other service providers to fulfill your bookings</li>
                            <li>Payment processors to handle transactions</li>
                            <li>Analytics and advertising partners (anonymized data)</li>
                            <li>Law enforcement when legally required</li>
                            <li>Professional advisers including lawyers and accountants</li>
                        </ul>
                        <p className="mt-3">We never sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access,
                            alteration, disclosure, or destruction. This includes encryption, secure servers, and access controls.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                        <p>
                            We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected,
                            including for the purposes of satisfying any legal, accounting, or reporting requirements.
                            Booking information is typically retained for 7 years for accounting and legal purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                        <p className="mb-3">Under data protection laws, you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                            <li><strong>Restriction:</strong> Request restriction of processing your data</li>
                            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                            <li><strong>Object:</strong> Object to processing of your personal data</li>
                            <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
                        </ul>
                        <p className="mt-3">To exercise any of these rights, please contact us at privacy@vanuatubooking.com</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our website and store certain information.
                            You can set your browser to refuse all cookies or to indicate when a cookie is being sent.
                            However, if you do not accept cookies, you may not be able to use some portions of our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
                        <p>
                            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
                            We encourage you to read the privacy policies of every website you visit.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                        <p>
                            Our services are not directed to individuals under the age of 18.
                            We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal data,
                            please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page
                            and updating the "Last Updated" date. You are advised to review this privacy policy periodically for any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p><strong>Email:</strong> privacy@vanuatubooking.com</p>
                            <p><strong>Phone:</strong> +678 123 4567</p>
                            <p><strong>Address:</strong> Port Vila, Vanuatu</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
