import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal as RNModal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  onShare?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewerModal({
  visible,
  onClose,
  images,
  initialIndex = 0,
  onShare,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const renderImage = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <RNModal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </Text>

          {onShare && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Image Carousel */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={initialIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(item, index) => `image-${index}`}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={32} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={32} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <View style={styles.thumbnailStrip}>
            <FlatList
              data={images}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  style={[
                    styles.thumbnail,
                    currentIndex === index && styles.thumbnailActive,
                  ]}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  {currentIndex === index && (
                    <View style={styles.thumbnailOverlay} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `thumbnail-${index}`}
            />
          </View>
        )}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + SPACING.md : SPACING.xl,
    paddingBottom: SPACING.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: SPACING.md,
  },
  navButtonRight: {
    right: SPACING.md,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: SPACING.md,
  },
  thumbnailList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107, 144, 128, 0.3)',
  },
});
