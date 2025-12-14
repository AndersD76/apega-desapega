import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import Modal from '../Modal';
import Button from '../Button';
import Pill from '../Pill';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  sortBy: string;
  priceRange: [number, number];
  sizes: string[];
  conditions: string[];
  brands: string[];
  colors: string[];
  location: string;
}

const SORT_OPTIONS = [
  { id: 'recent', label: 'mais recentes' },
  { id: 'price_asc', label: 'menor preço' },
  { id: 'price_desc', label: 'maior preço' },
  { id: 'popular', label: 'mais populares' },
];

const SIZE_OPTIONS = ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'único'];

const CONDITION_OPTIONS = [
  { id: 'new', label: 'novo' },
  { id: 'like_new', label: 'seminovo' },
  { id: 'good', label: 'usado - bom' },
  { id: 'fair', label: 'usado - regular' },
];

const COLOR_OPTIONS = [
  { id: 'white', label: 'branco', color: '#FFFFFF' },
  { id: 'black', label: 'preto', color: '#000000' },
  { id: 'gray', label: 'cinza', color: '#9CA3AF' },
  { id: 'red', label: 'vermelho', color: '#EF4444' },
  { id: 'blue', label: 'azul', color: '#3B82F6' },
  { id: 'green', label: 'verde', color: '#10B981' },
  { id: 'yellow', label: 'amarelo', color: '#F59E0B' },
  { id: 'pink', label: 'rosa', color: '#EC4899' },
  { id: 'purple', label: 'roxo', color: '#8B5CF6' },
  { id: 'brown', label: 'marrom', color: '#92400E' },
];

const POPULAR_BRANDS = [
  'zara', 'farm', 'levi\'s', 'nike', 'adidas',
  'renner', 'c&a', 'marisa', 'forever 21', 'shein',
];

export default function FiltersModal({ visible, onClose, onApply }: FiltersModalProps) {
  const [sortBy, setSortBy] = useState('recent');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customBrand, setCustomBrand] = useState('');

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleClearAll = () => {
    setSortBy('recent');
    setPriceMin(0);
    setPriceMax(500);
    setSelectedSizes([]);
    setSelectedConditions([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setCustomBrand('');
  };

  const handleApply = () => {
    onApply({
      sortBy,
      priceRange: [priceMin, priceMax],
      sizes: selectedSizes,
      conditions: selectedConditions,
      brands: selectedBrands,
      colors: selectedColors,
      location: '',
    });
    onClose();
  };

  const renderSectionTitle = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="bottom"
      title="filtros"
      showCloseButton={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearButton}>limpar tudo</Text>
        </TouchableOpacity>
        <Text style={styles.title}>filtros</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sort By */}
        {renderSectionTitle('ordenar por')}
        <View style={styles.section}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.sortOptionActive,
              ]}
              onPress={() => setSortBy(option.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        {renderSectionTitle('faixa de preço')}
        <View style={styles.section}>
          <View style={styles.priceInputs}>
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>mínimo</Text>
              <Text style={styles.priceValue}>R$ {priceMin}</Text>
            </View>
            <View style={styles.priceSeparator} />
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>máximo</Text>
              <Text style={styles.priceValue}>R$ {priceMax}</Text>
            </View>
          </View>
          <View style={styles.pricePresets}>
            <Pill
              label="até R$ 50"
              onPress={() => {
                setPriceMin(0);
                setPriceMax(50);
              }}
            />
            <Pill
              label="R$ 50-100"
              onPress={() => {
                setPriceMin(50);
                setPriceMax(100);
              }}
            />
            <Pill
              label="R$ 100-200"
              onPress={() => {
                setPriceMin(100);
                setPriceMax(200);
              }}
            />
            <Pill
              label="acima de R$ 200"
              onPress={() => {
                setPriceMin(200);
                setPriceMax(1000);
              }}
            />
          </View>
        </View>

        {/* Size */}
        {renderSectionTitle('tamanho')}
        <View style={styles.section}>
          <View style={styles.pillContainer}>
            {SIZE_OPTIONS.map((size) => (
              <Pill
                key={size}
                label={size}
                selected={selectedSizes.includes(size)}
                onPress={() => toggleSize(size)}
              />
            ))}
          </View>
        </View>

        {/* Condition */}
        {renderSectionTitle('condição')}
        <View style={styles.section}>
          {CONDITION_OPTIONS.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              style={[
                styles.checkboxOption,
                selectedConditions.includes(condition.id) && styles.checkboxOptionActive,
              ]}
              onPress={() => toggleCondition(condition.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedConditions.includes(condition.id) && styles.checkboxActive,
                ]}
              >
                {selectedConditions.includes(condition.id) && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{condition.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brand */}
        {renderSectionTitle('marca')}
        <View style={styles.section}>
          <View style={styles.pillContainer}>
            {POPULAR_BRANDS.map((brand) => (
              <Pill
                key={brand}
                label={brand}
                selected={selectedBrands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </View>
        </View>

        {/* Color */}
        {renderSectionTitle('cor')}
        <View style={styles.section}>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorOption,
                  selectedColors.includes(color.id) && styles.colorOptionActive,
                ]}
                onPress={() => toggleColor(color.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color.color },
                    color.id === 'white' && styles.colorCircleWhite,
                  ]}
                >
                  {selectedColors.includes(color.id) && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={color.id === 'white' || color.id === 'yellow' ? COLORS.textPrimary : COLORS.white}
                    />
                  )}
                </View>
                <Text style={styles.colorLabel}>{color.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          label="limpar"
          variant="secondary"
          onPress={handleClearAll}
          style={{ flex: 1 }}
        />
        <Button
          label="aplicar filtros"
          variant="primary"
          onPress={handleApply}
          style={{ flex: 2 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  clearButton: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  sortOptionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  sortOptionTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  priceInput: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  priceSeparator: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.sm,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  pricePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  checkboxOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  colorOption: {
    alignItems: 'center',
    width: 60,
  },
  colorOptionActive: {
    opacity: 1,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.xs,
  },
  colorCircleWhite: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  colorLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
});
