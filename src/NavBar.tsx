function NavBar() {
    return (
        <nav className="navbar bg-primary navbar-expand-lg" data-bs-theme="dark" style={{ margin: '24px', padding: '12px', borderRadius: '8px' }}>
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">
                    AiCodingCoach
                </span>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link" href="/CodingCoach/review">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/CodingCoach/repo">Import from Github</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;