import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentification - SPLANE',
    description: 'Connectez-vous à SPLANE pour gérer vos projets et tâches.',
};

const LoginLayout = ({ children }: { children: React.ReactNode }) => children

export default LoginLayout;

