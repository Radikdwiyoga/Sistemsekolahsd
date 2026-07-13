declare global {
  namespace Express {
    interface Session {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
    }
  }
}

export {};

