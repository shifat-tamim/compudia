import PublicLayout from '../Components/PublicLayout';

const sections = [
    {
        title: 'Acceptance of Terms',
        body: 'By using Compudia, you agree to these Terms. If you do not agree, do not use the website or tools.',
    },
    {
        title: 'The Service',
        body: 'Compudia provides browser-based image tools, starting with a remove-background editor. The tool may include automatic detection, manual selection, background options, preview, and download features.',
    },
    {
        title: 'Your Images and Content',
        body: 'You are responsible for the images and content you use with Compudia. You must have the rights and permissions needed to upload, edit, download, and use those images. Compudia does not claim ownership of your images.',
    },
    {
        title: 'Browser-Side Processing',
        body: 'Compudia V1 is designed to process images in your browser where possible. Results can vary depending on image quality, subject edges, browser performance, and device capabilities.',
    },
    {
        title: 'Acceptable Use',
        body: 'Do not use Compudia to violate laws, infringe intellectual property rights, upload malware, attempt unauthorized access, overload the service, or create or distribute harmful, deceptive, or illegal content.',
    },
    {
        title: 'Contact Messages',
        body: 'When you submit the contact form, you agree that Compudia may store and use the submitted information to respond, provide support, improve the service, and prevent abuse.',
    },
    {
        title: 'No Professional Advice',
        body: 'Compudia is a general image-editing website. Content on the site is not legal, financial, design, or professional advice.',
    },
    {
        title: 'Third-Party Services',
        body: 'The website may rely on hosting, database, email, analytics, advertising, or other third-party services. Those services may be subject to their own terms and policies.',
    },
    {
        title: 'Disclaimers',
        body: 'Compudia is provided on an “as is” and “as available” basis. We do not guarantee uninterrupted availability, perfect background removal, error-free operation, or that every result will meet your expectations.',
    },
    {
        title: 'Limitation of Liability',
        body: 'To the fullest extent permitted by applicable law, Compudia and its operators will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or for loss of data, profits, goodwill, or business opportunities.',
    },
    {
        title: 'Changes to the Terms',
        body: 'We may update these Terms as Compudia changes. The effective date on this page shows when they were last updated. Continued use of the website after changes means you accept the updated Terms.',
    },
];

export default function Terms() {
    return (
        <PublicLayout
            title="Terms of Service"
            description="Read Compudia's Terms of Service for using the website, image tools, contact form, and downloads."
            canonical="https://compudia.com/terms"
        >
            <main className="public-main legal-page">
                <section className="legal-hero">
                    <p className="eyebrow">Terms</p>
                    <h1>Terms of Service</h1>
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
                        <p>For questions about these Terms, email <a href="mailto:support@compudia.com">support@compudia.com</a> or use the <a href="/contact">contact page</a>.</p>
                    </section>

                    <p className="legal-note">These Terms are a practical starting point for Compudia V1 and should be reviewed by qualified legal counsel before launch in any specific jurisdiction.</p>
                </article>
            </main>
        </PublicLayout>
    );
}
