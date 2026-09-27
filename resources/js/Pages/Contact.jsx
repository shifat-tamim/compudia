import { useForm, usePage } from '@inertiajs/react';
import { FiClock, FiMail, FiMapPin, FiMessageCircle, FiSend, FiUser } from 'react-icons/fi';
import PublicLayout from '../Components/PublicLayout';

const canonical = 'https://compudia.com/contact';

export default function Contact() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset('name', 'email', 'message'),
        });
    };

    const successMessage = flash.success || (recentlySuccessful ? 'Thanks for reaching out. Your message has been saved.' : '');

    return (
        <PublicLayout
            title="Contact"
            description="Contact Compudia for questions, suggestions, feedback, and support."
            canonical={canonical}
        >
            <main className="public-main contact-page">
                <section className="contact-hero" aria-labelledby="contact-title">
                    <div className="contact-hero-bubbles" aria-hidden="true" />
                    <div className="contact-chat-decoration" aria-hidden="true">
                        <span />
                    </div>
                    <p className="eyebrow">Contact</p>
                    <h1 id="contact-title"><span>We'd Love</span> to Hear from You</h1>
                    <p>Have a question, suggestion, or feedback? Send us a message. We usually respond as soon as possible.</p>
                </section>

                <section className="contact-grid" aria-label="Contact form and information">
                    <div className="panel contact-card contact-form-card">
                        <div className="contact-card-heading">
                            <span><FiMail /></span>
                            <div>
                                <h2>Send a Message</h2>
                                <p>Fill out the form below and we'll get back to you soon.</p>
                            </div>
                        </div>

                        {successMessage && <p className="form-success" role="status">{successMessage}</p>}

                        <form className="contact-form" onSubmit={submit}>
                            <label>
                                <strong>Name</strong>
                                <span className="input-shell">
                                    <FiUser />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Your name"
                                        autoComplete="name"
                                        required
                                    />
                                </span>
                                {errors.name && <small>{errors.name}</small>}
                            </label>

                            <label>
                                <strong>Email</strong>
                                <span className="input-shell">
                                    <FiMail />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        placeholder="your@email.com"
                                        autoComplete="email"
                                        required
                                    />
                                </span>
                                {errors.email && <small>{errors.email}</small>}
                            </label>

                            <label>
                                <strong>Message</strong>
                                <span className="input-shell textarea-shell">
                                    <FiMessageCircle />
                                    <textarea
                                        value={data.message}
                                        onChange={(event) => setData('message', event.target.value)}
                                        placeholder="Write your message here..."
                                        rows="6"
                                        required
                                    />
                                </span>
                                {errors.message && <small>{errors.message}</small>}
                            </label>

                            <button className="primary-button contact-submit" type="submit" disabled={processing}>
                                <FiSend /> {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    <aside className="panel contact-card contact-info-card" aria-label="Contact information">
                        <div className="contact-card-heading">
                            <span><FiMail /></span>
                            <div>
                                <h2>Contact Information</h2>
                                <p>You can also reach us through the following:</p>
                            </div>
                        </div>

                        <div className="contact-info-list">
                            <article>
                                <span><FiMail /></span>
                                <div>
                                    <h3>Email</h3>
                                    <a href="mailto:support@compudia.com">support@compudia.com</a>
                                </div>
                            </article>
                            <article>
                                <span><FiClock /></span>
                                <div>
                                    <h3>Response Time</h3>
                                    <p>We usually reply within 1-2 business days.</p>
                                </div>
                            </article>
                            <article>
                                <span><FiMapPin /></span>
                                <div>
                                    <h3>Our Website</h3>
                                    <a href="https://compudia.com">https://compudia.com</a>
                                </div>
                            </article>
                        </div>

                        <div className="contact-illustration" aria-hidden="true">
                            <div className="envelope">
                                <span />
                            </div>
                            <div className="reply-bubble">Thanks for reaching out!</div>
                        </div>
                    </aside>
                </section>
            </main>
        </PublicLayout>
    );
}
