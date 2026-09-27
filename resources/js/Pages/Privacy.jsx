import PublicLayout from '../Components/PublicLayout';

const sections = [
    {
        title: 'Overview',
        body: 'This Privacy Policy explains how Compudia handles information when you use our website and image tools. Compudia is designed to process images in the browser whenever possible, so ordinary background-removal work does not require sending every image to our server.',
    },
    {
        title: 'Information We Collect',
        body: 'If you use the contact form, we collect your name, email address, message, IP address, browser user agent, and the date and time of submission. If you upload images into the editor, the current V1 tool is intended to process them locally in your browser unless a future feature clearly tells you otherwise.',
    },
    {
        title: 'How We Use Information',
        body: 'We use contact messages to reply to support requests, suggestions, and feedback. Technical data such as IP address and user agent helps protect the form from abuse, diagnose problems, and maintain the security of the service.',
    },
    {
        title: 'Images and Browser-Side Processing',
        body: 'Compudia’s image editor is built around browser-side processing. Your image may be loaded into your device memory so the tool can create masks, previews, and downloads. We do not claim ownership of images you edit with the tool.',
    },
    {
        title: 'Cookies, Analytics, and Ads',
        body: 'The V1 site does not require an account. If analytics, advertising, or measurement tools are added later, this policy should be updated before or when those tools are enabled so users can understand what is collected and why.',
    },
    {
        title: 'Sharing and Disclosure',
        body: 'We do not sell contact form messages. We may disclose information when needed to operate hosting, database, security, or email services, comply with legal obligations, prevent abuse, or protect Compudia and its users.',
    },
    {
        title: 'Retention',
        body: 'Contact messages are kept only as long as reasonably needed for support, business records, security, and legal purposes. Images processed locally in the browser are not intentionally stored by Compudia’s server in V1.',
    },
    {
        title: 'Security',
        body: 'We use reasonable technical and organizational safeguards for the information we store. No website or database can be guaranteed completely secure, so avoid sending sensitive personal, financial, health, or confidential information through the contact form.',
    },
    {
        title: 'Children',
        body: 'Compudia is not directed to children under 13. If you believe a child has submitted personal information through the contact form, contact us so we can review and delete it when appropriate.',
    },
    {
        title: 'Your Choices',
        body: 'You can request access, correction, or deletion of contact form information by emailing support@compudia.com. Some records may need to be retained where required for security, legal, or legitimate business purposes.',
    },
    {
        title: 'Changes',
        body: 'We may update this Privacy Policy as the product changes. The effective date on this page shows when it was last updated.',
    },
];

export default function Privacy() {
    return (
        <PublicLayout
            title="Privacy Policy"
            description="Read Compudia's Privacy Policy for browser-side image processing, contact form data, retention, and security."
            canonical="https://compudia.com/privacy"
        >
            <main className="public-main legal-page">
                <section className="legal-hero">
                    <p className="eyebrow">Privacy</p>
                    <h1>Privacy Policy</h1>
                    <p>Effective date: September 25, 2026</p>
                </section>

                <article className="panel legal-card">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2>{section.title}</h2>
                            <p>{section.body}</p>
                        </section>
                    ))}

                    <section>
                        <h2>Contact</h2>
                        <p>For privacy questions, email <a href="mailto:support@compudia.com">support@compudia.com</a> or use the <a href="/contact">contact page</a>.</p>
                    </section>

                    <p className="legal-note">This page is a practical website policy for Compudia V1 and should be reviewed by qualified legal counsel before launch in any specific jurisdiction.</p>
                </article>
            </main>
        </PublicLayout>
    );
}
