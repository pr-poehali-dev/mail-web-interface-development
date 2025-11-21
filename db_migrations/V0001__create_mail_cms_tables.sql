-- Mail CMS Database Schema

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mail accounts table
CREATE TABLE IF NOT EXISTS mail_accounts (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER REFERENCES domains(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    quota_mb INTEGER DEFAULT 1024,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Mail aliases/forwarding table
CREATE TABLE IF NOT EXISTS mail_aliases (
    id SERIAL PRIMARY KEY,
    source_email VARCHAR(255) NOT NULL,
    destination_email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mail statistics table
CREATE TABLE IF NOT EXISTS mail_stats (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES mail_accounts(id),
    emails_sent INTEGER DEFAULT 0,
    emails_received INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default domain
INSERT INTO domains (domain_name) VALUES ('nargizamail.ru');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mail_accounts_email ON mail_accounts(email);
CREATE INDEX IF NOT EXISTS idx_mail_accounts_domain ON mail_accounts(domain_id);
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
