/**
 * Utilitaire pour l'envoi d'emails
 * 
 * Note: Il s'agit d'une implémentation simulée pour le développement.
 * En production, vous utiliserez un service d'envoi d'emails comme
 * SendGrid, Mailgun, SES, etc.
 */

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // URL de réinitialisation (à adapter selon votre configuration de routes)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    // En développement, nous allons simplement simuler l'envoi d'un email
    // et afficher les informations dans la console
    console.log(`
      ==========================================
      SIMULATION D'EMAIL DE RÉINITIALISATION
      ==========================================
      À: ${email}
      Sujet: Réinitialisation de votre mot de passe SPLANE
      
      Bonjour,
      
      Vous recevez cet email car vous avez demandé une réinitialisation de mot de passe.
      Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe:
      
      ${resetUrl}
      
      Ce lien expirera dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
      
      Cordialement,
      L'équipe SPLANE
      ==========================================
    `);
    
    // En production, intégrez ici votre service d'envoi d'emails
    // Exemple avec un service comme SendGrid:
    /*
    await sendgrid.send({
      to: email,
      from: 'no-reply@splane.com',
      subject: 'Réinitialisation de votre mot de passe SPLANE',
      text: `...`,
      html: `...`,
    });
    */
  }