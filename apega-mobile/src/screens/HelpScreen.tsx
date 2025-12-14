import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Help'>;

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'Como faço para vender um produto?',
    answer: 'Para vender, vá até seu perfil e clique em "Anunciar produto". Tire fotos do item, adicione uma descrição e defina o preço. Após a aprovação, seu produto estará visível para compradores.',
  },
  {
    id: '2',
    question: 'Como funciona o frete?',
    answer: 'O frete é calculado automaticamente com base no CEP do comprador. Você pode gerar a etiqueta de envio diretamente pelo app e despachar o produto nos Correios ou transportadora parceira.',
  },
  {
    id: '3',
    question: 'Quando recebo o pagamento pela venda?',
    answer: 'O pagamento é liberado após o comprador confirmar o recebimento do produto ou automaticamente após 14 dias da entrega confirmada pelos Correios.',
  },
  {
    id: '4',
    question: 'Como funciona o cashback?',
    answer: 'Você ganha 5% de cashback em todas as compras realizadas no app. O valor fica disponível na sua carteira e pode ser usado em compras futuras ou sacado.',
  },
  {
    id: '5',
    question: 'Posso devolver um produto?',
    answer: 'Sim, você tem até 7 dias após o recebimento para solicitar a devolução se o produto não corresponder à descrição ou apresentar defeitos não informados.',
  },
];

export default function HelpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openWhatsApp = () => {
    const phoneNumber = '5554999648368';
    const message = 'Olá! Preciso de ajuda com o app Apega Desapega.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            'WhatsApp não encontrado',
            'Instale o WhatsApp para entrar em contato conosco.',
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
      });
  };

  const renderFAQItem = (faq: FAQ) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => toggleExpand(faq.id)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
      {expandedId === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ajuda e suporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>fale conosco</Text>
          <TouchableOpacity style={styles.whatsappCard} onPress={openWhatsApp}>
            <View style={styles.whatsappIconContainer}>
              <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
            </View>
            <View style={styles.whatsappInfo}>
              <Text style={styles.whatsappTitle}>WhatsApp</Text>
              <Text style={styles.whatsappNumber}>(54) 99964-8368</Text>
              <Text style={styles.whatsappHint}>Toque para abrir</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>perguntas frequentes</Text>
          {FAQS.map(renderFAQItem)}
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>links úteis</Text>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>guia do vendedor</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="shield-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>política de segurança</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="return-down-back-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>política de devolução</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>central de ajuda completa</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  contactSection: {
    marginBottom: SPACING.lg,
  },
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  whatsappIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#E8F5E9',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  whatsappInfo: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  whatsappNumber: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: '#25D366',
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  whatsappHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  faqSection: {
    marginBottom: SPACING.lg,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.xs,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  linksSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.xs,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
});
