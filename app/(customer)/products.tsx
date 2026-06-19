import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from "../../src/constants/theme";
import { subscribeToProducts } from "../../src/services/productService";
import { Product } from "../../src/types";

const CATEGORIES = [
  "All",
  "Business Cards",
  "Flyers",
  "Banners",
  "Stickers",
  "Brochures",
  "Other",
];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  useEffect(() => {
    const unsub = subscribeToProducts((p) => {
      setProducts(p.filter((x) => x.available));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "All" || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.header}>
        <Text style={styles.title}>Products</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.duration(500).delay(80).springify()} style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={18}
          color={COLORS.textMuted}
          style={{ marginLeft: 12 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Animated.View>

      {/* FIXED: Wrapped in a constrained layout container to prevent vertical stretching */}
      <Animated.View entering={FadeInUp.duration(500).delay(120).springify()} style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCat(item)}
              style={[
                styles.catChip,
                selectedCat === item && styles.catChipActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  selectedCat === item && styles.catTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(i) => i}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catListContent}
        />
      </Animated.View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={50} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={FadeInDown.duration(400).delay(150 + index * 60)}
              style={styles.cardContainer}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(customer)/place-order" as any,
                    params: {
                      productId: item.id,
                      productName: item.name,
                      basePrice: item.basePrice,
                    },
                  })
                }
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardImage}
                  />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Ionicons
                      name="image-outline"
                      size={36}
                      color={COLORS.textMuted}
                    />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardCat}>{item.category}</Text>
                  <Text style={styles.cardPrice}>
                    LKR {item.basePrice.toFixed(0)}
                  </Text>
                  <View style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>Order Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            gap: 12,
            paddingBottom: 20,
          }}
          columnWrapperStyle={{ gap: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 12,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },

  categoryContainer: {
    height: 48,
    marginBottom: SPACING.md,
  },
  catListContent: {
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  catTextActive: { color: "#fff", fontWeight: "600" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.base },
  cardContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardImage: { width: "100%", height: 120 },
  cardImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: SPACING.sm },
  cardName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardCat: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  cardPrice: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "800",
    color: COLORS.accent,
    marginTop: 6,
  },
  orderBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    alignItems: "center",
  },
  orderBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
