'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';

// Schémas de validation
const requestResetSchema = z.object({
  email: z.string().email('Email invalide'),
  tenant: z.string().min(3, 'Le code SDIS est requis'),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RequestResetData = z.infer<typeof requestResetSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [resetToken, setResetToken] = useState('');

  // Formulaire de demande de réinitialisation
  const requestForm = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
  });

  // Formulaire de réinitialisation du mot de passe
  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resetToken,
    },
  });

  // Envoyer l'email de réinitialisation
  const onRequestReset = async (data: RequestResetData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi');
      }
      
      setEmail(data.email);
      setEmailSent(true);
      
    } catch (error: any) {
      requestForm.setError('root', {
        type: 'manual',
        message: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser le mot de passe
  const onResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la réinitialisation');
      }
      
      // Rediriger vers la page de connexion avec un message de succès
      window.location.href = '/auth/login?reset=success';
      
    } catch (error: any) {
      resetForm.setError('root', {
        type: 'manual',
        message: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si un token est présent dans l'URL (pour le lien depuis l'email)
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
        setStep('reset');
        resetForm.setValue('token', token);
      }
    }
  });

  // Affichage après envoi de l'email
  if (emailSent && step === 'request') {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Email envoyé !</CardTitle>
          <CardDescription>
            Un email de réinitialisation a été envoyé à{' '}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Vérifiez votre boîte de réception et cliquez sur le lien de réinitialisation.
              Le lien expire dans 1 heure.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Vous n'avez pas reçu l'email ?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Vérifiez votre dossier spam</li>
              <li>• Assurez-vous que l'adresse email est correcte</li>
              <li>• Attendez quelques minutes</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              requestForm.reset();
            }}
            className="w-full"
          >
            Renvoyer l'email
          </Button>
          <Link href="/auth/login" className="text-sm text-center text-primary hover:underline">
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Formulaire de réinitialisation du mot de passe
  if (step === 'reset') {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-center">
            Choisissez un nouveau mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={resetForm.handleSubmit(onResetPassword)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...resetForm.register('password')}
                disabled={isLoading}
              />
              {resetForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.password.message}
                </p>
              )}
              <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                <li>• Au moins 8 caractères</li>
                <li>• Une majuscule et une minuscule</li>
                <li>• Un chiffre</li>
                <li>• Un caractère spécial</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...resetForm.register('confirmPassword')}
                disabled={isLoading}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            
            {resetForm.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resetForm.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
            <Link href="/auth/login" className="text-sm text-center text-primary hover:underline">
              Retour à la connexion
            </Link>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Formulaire de demande de réinitialisation
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          Mot de passe oublié ?
        </CardTitle>
        <CardDescription className="text-center">
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={requestForm.handleSubmit(onRequestReset)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant">Code SDIS</Label>
            <Input
              id="tenant"
              placeholder="Ex: sdis77"
              {...requestForm.register('tenant')}
              disabled={isLoading}
            />
            {requestForm.formState.errors.tenant && (
              <p className="text-sm text-destructive">
                {requestForm.formState.errors.tenant.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nom@sdis.fr"
              {...requestForm.register('email')}
              disabled={isLoading}
            />
            {requestForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>
          
          {requestForm.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>
                {requestForm.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <AlertDescription>
              Un email contenant un lien de réinitialisation sera envoyé à cette adresse si elle est associée à un compte.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </Button>
          
          <Link
            href="/auth/login"
            className="flex items-center justify-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}