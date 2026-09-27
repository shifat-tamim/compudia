import { Head } from '@inertiajs/react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';

export function PublicHeader() {
    return (
        <header className="site-header">
            <a className="brand" href="/" aria-label="Compudia home">
                <img className="brand-mark" src="/logo/compudia-logo.png" alt="" />
                <span className="brand-text"><strong>COMPU</strong>DIA</span>
            </a>
            <nav className="main-nav" aria-label="Main navigation">
                <div className="nav-menu">
                    <button type="button" aria-haspopup="true" aria-expanded="false">
                        Tools <FiChevronDown />
                    </button>
                    <div className="nav-submenu" role="menu">
                        <a className="active" href="/remove-background" role="menuitem">Remove Background</a>
                    </div>
                </div>
            </nav>
            <button className="language-button" type="button" aria-label="Change language">
                <FiGlobe /> EN <FiChevronDown />
            </button>
        </header>
    );
}

export function PublicFooter() {
    return (
        <footer className="site-footer">
            <span>© 2026 Compudia. All rights reserved.</span>
            <nav aria-label="Footer navigation">
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
                <a href="/contact">Contact</a>
            </nav>
        </footer>
    );
}

const siteName = 'Compudia';
const socialImage = 'https://compudia.com/logo/compudia-logo.png';

export default function PublicLayout({ title, description, canonical, children }) {
    const fullTitle = `${title} | ${siteName}`;

    return (
        <>
            <Head title={title}>
                {description && <meta name="description" content={description} />}
                {canonical && <link rel="canonical" href={canonical} />}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={fullTitle} />
                {description && <meta property="og:description" content={description} />}
                {canonical && <meta property="og:url" content={canonical} />}
                <meta property="og:image" content={socialImage} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={fullTitle} />
                {description && <meta name="twitter:description" content={description} />}
                <meta name="twitter:image" content={socialImage} />
            </Head>
            <div className="app-shell public-shell">
                <PublicHeader />
                <div className="page-glow page-glow-left" />
                <div className="page-glow page-glow-right" />
                {children}
                <PublicFooter />
            </div>
        </>
    );
}
