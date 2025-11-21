const BACKEND_URLS = {
  auth: 'https://functions.poehali.dev/2182b778-07ed-4c04-be40-74ce2b698cec',
  fetch: 'https://functions.poehali.dev/cad18501-411c-4ba4-a229-62016362649d',
  send: 'https://functions.poehali.dev/5f6f1f4b-75e1-459f-b8cf-b6ad274edb61',
  register: 'https://functions.poehali.dev/c513198c-9804-48b0-b7e2-47f36245bb09'
};

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface Email {
  id: number;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  isStarred: boolean;
  content: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export const mailApi = {
  async register(data: RegisterData): Promise<{ success: boolean; error?: string; email?: string }> {
    try {
      const response = await fetch(BACKEND_URLS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  },

  async authenticate(credentials: EmailCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(BACKEND_URLS.auth, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  },

  async fetchEmails(credentials: EmailCredentials, folder: string = 'inbox', limit: number = 20): Promise<{ success: boolean; emails?: Email[]; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URLS.fetch}?folder=${folder}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'X-User-Email': credentials.email,
          'X-User-Password': credentials.password
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  },

  async sendEmail(credentials: EmailCredentials, to: string, subject: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(BACKEND_URLS.send, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': credentials.email,
          'X-User-Password': credentials.password
        },
        body: JSON.stringify({ to, subject, content })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  }
};