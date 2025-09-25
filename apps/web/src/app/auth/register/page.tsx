'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserPlus, Building2, CheckCircle } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useAuthStore } from '../../../stores/auth.store';
import { useTenantStore } from '../../../stores/tenant.store';

const registerSchema = z.object({
  // Informations SDIS
  tenantName: z.string()
    .min(3, 'Le nom du SDIS doit contenir au moins 3 caractères')
    .max(50, 'Le nom du SDIS ne peut pas dépasser 50 caractères'),
  tenantSlug: z.string()
    .min(3, 'Le code SDIS doit contenir au moins 3 caractères')
    .max(20, 'Le code SDIS ne peut pas dépasser 20 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le code SDIS ne peut contenir que des lettres minuscules, chiffres et tirets'),
  
  // Informations personnelles
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(30, 'Le prénom ne peut pas dépasser 30 caractères'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(30, 'Le nom ne peut pas dépasser 30 caractères'),
  email: z.string()
    .email('Email invalide')
    .toLowerCase(),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  
  // Sécurité
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
  
  // Conditions
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTenant = useTenantStore((state) => state.setTenant);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: SDIS info, 2: Personal info, 3: Security
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });
  
  const watchTenantSlug = watch('tenantSlug');
  
  // Générer automatiquement le slug à partir du nom
  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    
    const input = document.getElementById('tenantSlug') as HTMLInputElement;
    if (input) {
      input.value = slug;
    }
  };
  
  const validateStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ['tenantName', 'tenantSlug'];
        break;
      case 2:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        break;
      case 3:
        fieldsToValidate = ['password', 'confirmPassword', 'acceptTerms'];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step < 3) {
        setStep(step + 1);
      }
    }
  };
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }
      
      const result = await response.json();
      
      // Afficher le message de succès
      setShowSuccess(true);
      
      // Connecter automatiquement après 2 secondes
      setTimeout(() => {
        if (result.user && result.token) {
          setAuth(result.user, result.token, result.refreshToken);
          setTenant(result.tenant);
        }
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: unknown) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
          <CardDescription>
            Votre compte a été créé avec succès. Vous allez être redirigé vers le tableau de bord...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Inscrivez votre SDIS sur MindSP
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center font-medium
                    ${step >= i 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2
                      ${step > i ? 'bg-primary' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Step 1: SDIS Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Informations SDIS</h3>
                <p className="text-sm text-muted-foreground">
                  Configurez votre espace SDIS
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenantName">
                  Nom du SDIS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tenantName"
                  placeholder="Ex: SDIS 77 - Seine-et-Marne"
                  {...register('tenantName')}
                  onChange={(e) => {
                    register('tenantName').onChange(e);
                    handleTenantNameChange(e);
                  }}
                  disabled={isLoading}
                />
                {errors.tenantName && (
                  <p className="text-sm text-destructive">{errors.tenantName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenantSlug">
                  Code SDIS <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">mindsp.fr/</span>
                  <Input
                    id="tenantSlug"
                    placeholder="sdis77"
                    {...register('tenantSlug')}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                {errors.tenantSlug && (
                  <p className="text-sm text-destructive">{errors.tenantSlug.message}</p>
                )}
                {watchTenantSlug && (
                  <p className="text-xs text-muted-foreground">
                    URL de votre espace : https://{watchTenantSlug}.mindsp.fr
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Informations personnelles</h3>
                <p className="text-sm text-muted-foreground">
                  Créez votre compte administrateur
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email professionnel <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@sdis77.fr"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Téléphone (optionnel)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  {...register('phone')}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 3: Security */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Sécurité</h3>
                <p className="text-sm text-muted-foreground">
                  Sécurisez votre compte
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>• Au moins 8 caractères</li>
                  <li>• Une majuscule et une minuscule</li>
                  <li>• Un chiffre</li>
                  <li>• Un caractère spécial</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                )}
              </div>
            </div>
          )}
          
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <div className="flex gap-2 w-full">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={validateStep}
                disabled={isLoading}
                className="flex-1"
              >
                Suivant
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            )}
          </div>
          
          <div className="text-sm text-center text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}