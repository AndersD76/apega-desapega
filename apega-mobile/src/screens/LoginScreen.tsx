import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, BRAND } from '../constants/theme';
import { Input, Button, BrandLogo } from '../components';
import { login, register } from '../services/auth';

interface LoginScreenProps {
  navigation: any;
}

type Screen = 'login' | 'signup' | 'forgot' | 'onboarding';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    icon: '🛍️',
    title: 'compre moda sustentável',
    description: 'encontre peças únicas com até 70% de desconto',
  },
  {
    id: 2,
    icon: '💰',
    title: 'venda o que não usa mais',
    description: 'transforme seu guarda-roupa parado em dinheiro',
  },
  {
    id: 3,
    icon: '💚',
    title: 'impacto positivo',
    description: 'cada compra ajuda o planeta e apoia pequenas vendedoras',
  },
];

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupPasswordConfirm, setShowSignupPasswordConfirm] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || signupName.length < 3) {
      Alert.alert('Erro', 'Nome deve ter no mínimo 3 caracteres');
      return;
    }
    if (!signupEmail || !signupEmail.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }
    if (!signupPassword || signupPassword.length < 8) {
      Alert.alert('Erro', 'Senha deve ter no mínimo 8 caracteres');
      return;
    }
    if (signupPassword !== signupPasswordConfirm) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Erro', 'Você deve aceitar os termos de uso');
      return;
    }

    setIsLoading(true);
    try {
      await register(signupEmail, signupPassword, signupName);
      setCurrentScreen('onboarding');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha no cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      alert('Email inválido');
      return;
    }
    console.log('Forgot password:', forgotEmail);
    setEmailSent(true);
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < ONBOARDING_SLIDES.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      navigation.navigate('Home');
    }
  };

  const handleOnboardingSkip = () => {
    navigation.navigate('Home');
  };

  // Onboarding View
  if (currentScreen === 'onboarding') {
    const slide = ONBOARDING_SLIDES[onboardingStep];
    const isLastSlide = onboardingStep === ONBOARDING_SLIDES.length - 1;

    return (
      <View style={styles.onboardingContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleOnboardingSkip}
        >
          {!isLastSlide && <Text style={styles.skipText}>pular</Text>}
        </TouchableOpacity>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingIcon}>
            <Text style={styles.onboardingIconText}>{slide.icon}</Text>
          </View>

          <Text style={styles.onboardingTitle}>{slide.title}</Text>
          <Text style={styles.onboardingDescription}>{slide.description}</Text>

          <View style={styles.onboardingDots}>
            {ONBOARDING_SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === onboardingStep && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Button
            label={isLastSlide ? 'começar' : 'próximo'}
            variant="primary"
            onPress={handleOnboardingNext}
            fullWidth
            style={styles.onboardingButton}
          />
        </View>
      </View>
    );
  }

  // Login View
  if (currentScreen === 'login') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header com gradiente */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark || '#5a8a7a']}
            style={styles.loginHeader}
          >
            <BrandLogo size="large" color="light" />
            <Text style={styles.brandTagline}>moda circular e consciente</Text>
          </LinearGradient>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>bem-vinda de volta!</Text>
            <Text style={styles.welcomeSubtitle}>entre para continuar comprando e vendendo</Text>

            <Input
              label="e-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={{ position: 'relative' }}>
              <Input
                label="senha"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setCurrentScreen('forgot')}>
              <Text style={styles.forgotLink}>esqueci minha senha</Text>
            </TouchableOpacity>

            <Button
              label={isLoading ? 'entrando...' : 'entrar'}
              variant="primary"
              onPress={handleLogin}
              fullWidth
              disabled={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>não tem conta? </Text>
              <TouchableOpacity onPress={() => setCurrentScreen('signup')}>
                <Text style={styles.footerLink}>criar conta grátis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Signup View
  if (currentScreen === 'signup') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('login')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>crie sua conta</Text>

        <Input
          label="nome completo"
          required
          value={signupName}
          onChangeText={setSignupName}
          placeholder="Maria Silva"
        />

        <Input
          label="e-mail"
          required
          value={signupEmail}
          onChangeText={setSignupEmail}
          placeholder="maria@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={{ position: 'relative' }}>
          <Input
            label="senha"
            required
            value={signupPassword}
            onChangeText={setSignupPassword}
            placeholder="••••••••"
            secureTextEntry={!showSignupPassword}
            helperText="mínimo 8 caracteres"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowSignupPassword(!showSignupPassword)}
          >
            <Ionicons
              name={showSignupPassword ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={{ position: 'relative' }}>
          <Input
            label="confirmar senha"
            required
            value={signupPasswordConfirm}
            onChangeText={setSignupPasswordConfirm}
            placeholder="••••••••"
            secureTextEntry={!showSignupPasswordConfirm}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowSignupPasswordConfirm(!showSignupPasswordConfirm)}
          >
            <Ionicons
              name={showSignupPasswordConfirm ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <Ionicons
            name={acceptTerms ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptTerms ? COLORS.primary : COLORS.gray[400]}
          />
          <Text style={styles.checkboxLabel}>
            aceito os termos de uso e política de privacidade
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptMarketing(!acceptMarketing)}
        >
          <Ionicons
            name={acceptMarketing ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptMarketing ? COLORS.primary : COLORS.gray[400]}
          />
          <Text style={styles.checkboxLabel}>
            quero receber novidades por email
          </Text>
        </TouchableOpacity>

        <Button
          label={isLoading ? 'criando...' : 'criar conta'}
          variant="primary"
          onPress={handleSignup}
          fullWidth
          disabled={isLoading}
          style={{ marginTop: SPACING.lg }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>já tem conta? </Text>
          <TouchableOpacity onPress={() => setCurrentScreen('login')}>
            <Text style={styles.footerLink}>fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Forgot Password View
  if (currentScreen === 'forgot') {
    if (emailSent) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.title}>e-mail enviado!</Text>
          <Text style={styles.description}>
            confira sua caixa de entrada em {forgotEmail}
          </Text>

          <TouchableOpacity onPress={() => setEmailSent(false)}>
            <Text style={styles.link}>não recebeu? reenviar e-mail</Text>
          </TouchableOpacity>

          <Button
            label="voltar para login"
            variant="secondary"
            onPress={() => {
              setCurrentScreen('login');
              setEmailSent(false);
            }}
            fullWidth
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('login')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>esqueceu sua senha?</Text>
        <Text style={styles.description}>
          sem problemas! digite seu e-mail e enviaremos um link para redefinir sua senha
        </Text>

        <Input
          label="e-mail"
          value={forgotEmail}
          onChangeText={setForgotEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          label="enviar link"
          variant="primary"
          onPress={handleForgotPassword}
          fullWidth
          style={{ marginTop: SPACING.lg }}
        />

        <TouchableOpacity
          style={{ marginTop: SPACING.xl }}
          onPress={() => setCurrentScreen('login')}
        >
          <Text style={styles.link}>voltar para login</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.xl,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  // Login screen styles
  loginContent: {
    flexGrow: 1,
  },
  loginHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.white,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  loginLogoImage: {
    width: 140,
    height: 140,
    marginBottom: SPACING.md,
  },
  brandTagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  formContainer: {
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  forgotLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'right',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    paddingHorizontal: SPACING.md,
  },
  // Legacy styles
  logoContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: 38,
    padding: SPACING.sm,
  },
  link: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  backButton: {
    marginBottom: SPACING.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  onboardingIcon: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['4xl'],
  },
  onboardingIconText: {
    fontSize: 120,
  },
  onboardingTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  onboardingDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['4xl'],
    lineHeight: 24,
    maxWidth: 300,
  },
  onboardingDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING['4xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  onboardingButton: {
    maxWidth: 300,
  },
});
