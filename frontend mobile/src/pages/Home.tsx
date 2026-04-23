import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";
import {
  getCreadiScoreLatest,
  getCreditBalance,
  getKycStatus,
  getMyInstallments,
  getMyPayments,
  getProfile,
  getUnreadNotificationCount,
  CreditBalanceResult,
  Installment,
  KycStatusResult,
  Payment,
  RiskLevel,
  UserProfile,
  API_BASE_URL,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { colors, radii } from "@/lib/theme";

const promos = [
  { title: "0% interet", subtitle: "Chez Mytek jusqu'au 30 Oct" },
  { title: "Offre speciale", subtitle: "2x points fidelite Aziza" },
  { title: "Nouveau partenaire", subtitle: "IKEA maintenant disponible" },
];

const quickActions: Array<{ label: string; route: AppRoute; icon: string; color: string }> = [
  { label: "Creadi Score", route: "CreadiScore", icon: "speedometer", color: "#16a34a" },
  { label: "Boutique", route: "Shops", icon: "storefront-outline", color: "#6C63FF" },
  { label: "Mes Credits", route: "Credit", icon: "cash-fast", color: "#F59E0B" },
];

interface DealItem {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  endAtIso: string;
  hot?: boolean;
  storeUrl: string;
}

const deals: DealItem[] = [
  {
    id: "zara-jacket",
    name: "Zara Quilted Jacket",
    brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
    price: 189,
    originalPrice: 259,
    endAtIso: "2026-04-09T22:30:00.000Z",
    hot: true,
    storeUrl: "https://www.zara.com",
  },
  {
    id: "bershka-denim",
    name: "Bershka Denim Set",
    brand: "Bershka",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
    price: 139,
    originalPrice: 199,
    endAtIso: "2026-04-09T21:10:00.000Z",
    hot: true,
    storeUrl: "https://www.bershka.com",
  },
  {
    id: "decathlon-run",
    name: "Decathlon Running Pack",
    brand: "Decathlon",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
    price: 229,
    originalPrice: 299,
    endAtIso: "2026-04-10T08:00:00.000Z",
    storeUrl: "https://www.decathlon.tn",
  },
  {
    id: "megapc-headset",
    name: "Mega PC Gaming Headset",
    brand: "Mega PC",
    imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=1200",
    price: 269,
    originalPrice: 349,
    endAtIso: "2026-04-09T19:15:00.000Z",
    hot: true,
    storeUrl: "https://www.mega-pc.tn",
  },
  {
    id: "zara-sneakers",
    name: "Zara Urban Sneakers",
    brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    price: 119,
    originalPrice: 169,
    endAtIso: "2026-04-09T17:45:00.000Z",
    storeUrl: "https://www.zara.com",
  },
  {
    id: "decathlon-watch",
    name: "Decathlon Smart Watch",
    brand: "Decathlon",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
    price: 179,
    originalPrice: 239,
    endAtIso: "2026-04-10T11:00:00.000Z",
    storeUrl: "https://www.decathlon.tn",
  },
];

const toMoney = (value?: number) => `${Math.round(value ?? 0)} DT`;

const toPrettyDate = (dateIso?: string) => {
  if (!dateIso) {
    return "-";
  }
  const date = new Date(dateIso);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const toDealMoney = (value: number) => `${value.toFixed(0)} TND`;

const formatCountdown = (endAtIso: string, nowMs: number) => {
  const remaining = Math.max(0, new Date(endAtIso).getTime() - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const DealCard = ({
  item,
  nowMs,
  width,
  compact,
  onBuy,
}: {
  item: DealItem;
  nowMs: number;
  width: number;
  compact?: boolean;
  onBuy: () => void;
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const tickAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    tickAnim.setValue(0.92);
    Animated.timing(tickAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [nowMs, tickAnim]);

  const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <Animated.View
      style={[
        styles.dealCard,
        compact && styles.dealCardCompact,
        { width, transform: [{ scale: Animated.multiply(pressScale, tickAnim) }] },
      ]}
    >
      <Pressable
        onPressIn={() => {
          Animated.timing(pressScale, { toValue: 0.985, duration: 120, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.timing(pressScale, { toValue: 1, duration: 140, useNativeDriver: true }).start();
        }}
        style={({ pressed }) => [styles.dealCardInner, pressed && styles.dealCardPressed]}
      >
        <View>
          <Image source={{ uri: item.imageUrl }} style={[styles.dealImage, compact && styles.dealImageCompact]} />
          {item.hot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>Hot Deal</Text>
            </View>
          )}
        </View>

        <View style={styles.dealBody}>
          <Text numberOfLines={1} style={styles.dealBrand}>{item.brand}</Text>
          <Text numberOfLines={2} style={styles.dealName}>{item.name}</Text>

          <View style={styles.dealPriceRow}>
            <Text style={styles.dealPrice}>{toDealMoney(item.price)}</Text>
            <Text style={styles.dealOriginalPrice}>{toDealMoney(item.originalPrice)}</Text>
            <View style={styles.discountPill}><Text style={styles.discountPillText}>-{discountPct}%</Text></View>
          </View>

          <View style={styles.timerRow}>
            <MaterialCommunityIcons name="timer-sand" size={14} color="#9f1239" />
            <Text style={styles.timerLabel}>Flash Sale</Text>
            <Text style={styles.timerValue}>{formatCountdown(item.endAtIso, nowMs)}</Text>
          </View>

          <View style={styles.cardButtonsRow}>
            <Pressable style={styles.buyButton} onPress={onBuy}>
              <Text style={styles.buyButtonText}>Buy with Creadi</Text>
            </Pressable>
            <Pressable style={styles.visitButton} onPress={() => Linking.openURL(item.storeUrl)}>
              <Text style={styles.visitButtonText}>Visit Store</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const getInstallmentPriority = (status: Installment["status"]) => {
  if (status === "OVERDUE") {
    return 0;
  }
  if (status === "PENDING") {
    return 1;
  }
  return 2;
};

const Home = () => {
  const { navigate } = useAppNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const { user, creditSyncVersion } = useAuth();
  const carouselRef = useRef<ScrollView | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalanceResult | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const carouselDeals = deals.slice(3);
  const carouselCardWidth = Math.min(screenWidth * 0.78, 330);
  const carouselSnap = carouselCardWidth + 12;

  useEffect(() => {
    const interval = setInterval(() => setPromoIndex((i) => (i + 1) % promos.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carouselDeals.length <= 1 || isUserInteracting) {
      return;
    }

    const interval = setInterval(() => {
      setCarouselIndex((previous) => {
        const next = (previous + 1) % carouselDeals.length;
        carouselRef.current?.scrollTo({ x: next * carouselSnap, animated: true });
        return next;
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [carouselDeals.length, carouselSnap, isUserInteracting]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [installmentData, paymentData, scoreData, unreadData, kycData, profileData, balanceData] = await Promise.all([
          getMyInstallments(user.userId),
          getMyPayments(user.userId),
          getCreadiScoreLatest(user.userId).catch(() => null),
          getUnreadNotificationCount(user.userId),
          getKycStatus(user.userId).catch(() => null),
          getProfile(user.userId).catch(() => null),
          getCreditBalance(user.userId).catch(() => null),
        ]);

        setInstallments(installmentData);
        setPayments(paymentData);
        setScore(scoreData?.score ?? null);
        setCreditBalance(balanceData);
        setRiskLevel(scoreData?.risk ?? null);
        setKycStatus(kycData?.status ?? null);
        setUnreadCount(unreadData);
        setProfile(profileData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, creditSyncVersion]);

  const nextInstallment = useMemo(() => {
    const dueItems = installments
      .filter((item) => item.status === "PENDING" || item.status === "OVERDUE")
      .sort((a, b) => {
        const statusDelta = getInstallmentPriority(a.status) - getInstallmentPriority(b.status);
        if (statusDelta !== 0) {
          return statusDelta;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    return dueItems[0] ?? null;
  }, [installments]);

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 3),
    [payments],
  );

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>Session expiree</Text>
          <Text style={styles.emptySubtitle}>Connectez-vous pour charger vos donnees.</Text>
          <Pressable style={styles.primarySmall} onPress={() => navigate("Login")}>
            <Text style={styles.primarySmallText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {profile?.profilePhotoUrl ? (
              <Image source={{ uri: `${API_BASE_URL}${profile.profilePhotoUrl}` }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}><Text style={styles.avatarText}>{`${user.firstName[0] ?? "U"}${user.lastName[0] ?? "S"}`}</Text></View>
            )}
            <View>
              <Text style={styles.hello}>Bonjour</Text>
              <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
            </View>
          </View>
          <View style={styles.bell}><Text style={styles.bellText}>{unreadCount > 0 ? unreadCount : "0"}</Text></View>
        </View>

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        {loading && <Text style={styles.infoText}>Chargement des donnees...</Text>}

        {/* ── CARD 1: Your Credit ── */}
        {(() => {
          const limit = creditBalance?.totalLimit ?? 0;
          const used = creditBalance?.usedCredit ?? 0;
          const available = creditBalance?.availableCredit ?? (limit - used);
          const usedPct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
          const barColor = usedPct >= 80 ? colors.error : usedPct >= 50 ? colors.warning : colors.success;
          return (
            <View style={styles.creditMainCard}>
              <View style={styles.creditMainHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.creditMainLabel}>Votre Crédit</Text>
                  <Text style={styles.creditMainLimit}>{toMoney(limit)}</Text>
                  <Text style={styles.creditMainSublabel}>Limite totale</Text>
                </View>
                <View style={styles.creditMainRight}>
                  <Text style={styles.creditUsedLabel}>Utilisé</Text>
                  <Text style={styles.creditUsedValue}>{toMoney(used)}</Text>
                </View>
              </View>
              <View style={styles.creditBarTrack}>
                <View style={[styles.creditBarFill, { width: `${usedPct}%`, backgroundColor: barColor }]} />
              </View>
              <View style={styles.creditBarRow}>
                <Text style={styles.creditBarPct}>{usedPct}% utilisé</Text>
                <Text style={styles.creditAvailText}>
                  <Text style={styles.creditAvailAmount}>{toMoney(available)}</Text>
                  {" disponible"}
                </Text>
              </View>
              {nextInstallment && (
                <View style={styles.creditNextRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.creditNextText}>
                    Prochain paiement : <Text style={{ fontWeight: "800" }}>{toMoney(nextInstallment.amount)}</Text>
                    {" le "}<Text style={{ fontWeight: "800" }}>{toPrettyDate(nextInstallment.dueDate)}</Text>
                  </Text>
                  <Pressable style={styles.creditPayBtn} onPress={() => navigate("Installments")}>
                    <Text style={styles.creditPayBtnText}>Payer</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })()}

        {/* ── CARD 2: Credit Health ── */}
        {(() => {
          const isGood = riskLevel === "LOW" || (score !== null && score >= 700);
          const isMed  = riskLevel === "MODERATE" || (score !== null && score >= 500 && score < 700);
          const isRisk = riskLevel === "HIGH" || riskLevel === "CRITICAL" || (score !== null && score < 500);
          const label  = isGood ? "Bonne santé" : isMed ? "Moyen" : isRisk ? "À risque" : "En évaluation";
          const icon   = isGood ? "shield-check" : isMed ? "shield-alert" : isRisk ? "shield-off" : "shield-outline";
          const bg     = isGood ? "#0d2818" : isMed ? "#2d1f00" : isRisk ? "#2d0a0a" : colors.surface;
          const fg     = isGood ? colors.success : isMed ? colors.warning : isRisk ? colors.error : colors.gray500;
          return (
            <View style={[styles.healthCard, { backgroundColor: bg, borderColor: fg + "44" }]}>
              <MaterialCommunityIcons name={icon as never} size={28} color={fg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.healthTitle}>Santé du Crédit</Text>
                <Text style={[styles.healthLabel, { color: fg }]}>{label}</Text>
              </View>
              {score !== null && (
                <Pressable onPress={() => navigate("CreadiScore")}>
                  <Text style={[styles.healthScore, { color: fg }]}>{score}/1000</Text>
                  <Text style={styles.healthScoreSub}>Score</Text>
                </Pressable>
              )}
            </View>
          );
        })()}

        {kycStatus === "APPROVED" ? (
          <View style={styles.kycApprovedCard}>
            <MaterialCommunityIcons name="shield-check" size={16} color={colors.success} />
            <Text style={styles.kycApprovedText}>Identité vérifiée</Text>
          </View>
        ) : (
          <Pressable style={styles.kycCard} onPress={() => navigate("Kyc")}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.primary} />
            <Text style={styles.kycPendingText}>Verifier votre identite</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.gray400} style={{ marginLeft: "auto" }} />
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Acces rapide</Text>
        <View style={styles.actionRow}>
          {quickActions.map((action) => (
            <Pressable key={action.label} style={styles.actionCard} onPress={() => navigate(action.route)}>
              <View style={[styles.actionIconWrap, { backgroundColor: action.color }]}>
                <MaterialCommunityIcons name={action.icon as never} size={18} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.ctaButton} onPress={() => navigate("Credit")}>
          <MaterialCommunityIcons name="cash-fast" size={18} color="#fff" />
          <Text style={styles.ctaText}>Demander un credit maintenant</Text>
        </Pressable>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>{promos[promoIndex].title}</Text>
          <Text style={styles.promoSub}>{promos[promoIndex].subtitle}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Deals + Flash Sale</Text>
          <Pressable onPress={() => navigate("Shops")}><Text style={styles.link}>Voir plus</Text></Pressable>
        </View>

        <DealCard item={deals[0]} nowMs={nowMs} width={screenWidth - 40} onBuy={() => navigate("Credit", { prefillAmount: deals[0].price, productName: deals[0].name })} />

        <View style={styles.splitDealsRow}>
          <DealCard
            item={deals[1]}
            nowMs={nowMs}
            width={(screenWidth - 52) / 2}
            compact
            onBuy={() => navigate("Credit", { prefillAmount: deals[1].price, productName: deals[1].name })}
          />
          <DealCard
            item={deals[2]}
            nowMs={nowMs}
            width={(screenWidth - 52) / 2}
            compact
            onBuy={() => navigate("Credit", { prefillAmount: deals[2].price, productName: deals[2].name })}
          />
        </View>

        <ScrollView
          ref={carouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={carouselSnap}
          snapToAlignment="start"
          contentContainerStyle={styles.carouselContent}
          onScrollBeginDrag={() => setIsUserInteracting(true)}
          onMomentumScrollEnd={() => setIsUserInteracting(false)}
          onScroll={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselSnap);
            if (nextIndex !== carouselIndex && nextIndex >= 0 && nextIndex < carouselDeals.length) {
              setCarouselIndex(nextIndex);
            }
          }}
          scrollEventThrottle={16}
        >
          {carouselDeals.map((deal) => (
            <DealCard
              key={deal.id}
              item={deal}
              nowMs={nowMs}
              width={carouselCardWidth}
              onBuy={() => navigate("Credit", { prefillAmount: deal.price, productName: deal.name })}
            />
          ))}
        </ScrollView>

        <View style={styles.carouselDotsRow}>
          {carouselDeals.map((deal, index) => (
            <Pressable
              key={deal.id}
              onPress={() => {
                setCarouselIndex(index);
                carouselRef.current?.scrollTo({ x: index * carouselSnap, animated: true });
              }}
              style={[styles.carouselDot, index === carouselIndex && styles.carouselDotActive]}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={styles.listCard}>
          {recentPayments.map((txn) => (
            <View key={txn.id} style={styles.listRow}>
              <View>
                <Text style={styles.txnLabel}>{`Paiement #${txn.installmentId}`}</Text>
                <Text style={styles.txnDate}>{toPrettyDate(txn.paidAt)}</Text>
              </View>
              <Text style={styles.txnAmount}>{`-${toMoney(txn.amount)}`}</Text>
            </View>
          ))}
          {recentPayments.length === 0 && <Text style={styles.emptyListText}>Aucun paiement recent.</Text>}
        </View>
      </ScrollView>
      <BottomNav />
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: radii.xl, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 48, height: 48, borderRadius: radii.xl },
  avatarText: { color: colors.white, fontWeight: "700" },
  hello: { fontSize: 12, color: colors.gray500 },
  name: { fontSize: 15, fontWeight: "700", color: colors.gray900 },
  bell: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, alignItems: "center", justifyContent: "center" },
  bellText: { fontSize: 12, fontWeight: "700", color: colors.gray900 },
  // ── Credit main card ──
  creditMainCard: { backgroundColor: colors.primary, borderRadius: radii.xxl, padding: 20, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 7 },
  creditMainHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  creditMainLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  creditMainLimit: { color: "#ffffff", fontSize: 32, fontWeight: "800", marginTop: 4 },
  creditMainSublabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  creditMainRight: { alignItems: "flex-end" },
  creditUsedLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  creditUsedValue: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 },
  creditBarTrack: { height: 8, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden", marginBottom: 6 },
  creditBarFill: { height: "100%", borderRadius: 6 },
  creditBarRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  creditBarPct: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" },
  creditAvailText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  creditAvailAmount: { color: "#ffffff", fontWeight: "800" },
  creditNextRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", flexDirection: "row", alignItems: "center", gap: 6 },
  creditNextText: { flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 12 },
  creditPayBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 7, paddingHorizontal: 14, borderRadius: radii.md },
  creditPayBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // ── Credit health card ──
  healthCard: { borderRadius: radii.xl, borderWidth: 1.5, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  healthTitle: { fontSize: 11, color: colors.gray500, fontWeight: "700", textTransform: "uppercase" },
  healthLabel: { fontSize: 17, fontWeight: "800", marginTop: 3 },
  healthScore: { fontSize: 20, fontWeight: "800", textAlign: "right" },
  healthScoreSub: { fontSize: 10, color: colors.gray500, textAlign: "right", fontWeight: "700", textTransform: "uppercase" },

  // ── Legacy kept for other parts of the layout ──
  balanceCard: { backgroundColor: colors.primary, borderRadius: radii.xxl, padding: 18 },
  balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  balanceValue: { color: "#ffffff", fontSize: 30, fontWeight: "700", marginTop: 6 },
  creditStatsRow: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)" },
  creditStat: { flex: 1, alignItems: "center" },
  creditStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  creditStatValue: { color: "#ffffff", fontSize: 14, fontWeight: "700", marginTop: 2 },
  creditStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  riskRow: { marginTop: 8 },
  riskBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.2)" },
  riskLow: { backgroundColor: "rgba(16,185,129,0.3)" },
  riskModerate: { backgroundColor: "rgba(245,158,11,0.3)" },
  riskHigh: { backgroundColor: "rgba(239,68,68,0.3)" },
  riskCritical: { backgroundColor: "rgba(239,68,68,0.5)" },
  riskBadgeText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  balanceBottom: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceHint: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  balanceDate: { color: "#ffffff", fontSize: 12, marginTop: 2 },
  primarySmall: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.md },
  primarySmallText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  scoreCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.lg, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreTitle: { fontSize: 13, fontWeight: "700", color: colors.gray900 },
  scoreSub: { fontSize: 13, color: colors.primary, fontWeight: "800" },
  kycCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: colors.primary + "30", borderRadius: radii.lg, padding: 12 },
  kycPendingText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  kycApprovedCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0d2818", borderWidth: 1, borderColor: colors.success + "30", borderRadius: radii.lg, padding: 12 },
  kycApprovedText: { fontSize: 12, fontWeight: "700", color: colors.success },
  sectionTitle: { fontSize: 12, color: colors.gray500, fontWeight: "700", textTransform: "uppercase" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.xl, padding: 12, minHeight: 92, justifyContent: "center", alignItems: "center", gap: 8 },
  actionIconWrap: { width: 34, height: 34, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, textAlign: "center", fontWeight: "700", color: colors.gray900 },
  ctaButton: { marginTop: 2, backgroundColor: colors.accent, borderRadius: radii.xl, paddingVertical: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaText: { color: colors.white, fontWeight: "700" },
  promoCard: { backgroundColor: colors.primary, borderRadius: radii.xl, padding: 14 },
  promoTitle: { color: colors.white, fontWeight: "700", fontSize: 14 },
  promoSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  link: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  splitDealsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", gap: 10 },
  carouselContent: { paddingRight: 8, paddingTop: 2 },
  carouselDotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: -4 },
  carouselDot: { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.gray300 },
  carouselDotActive: { width: 22, backgroundColor: colors.accent },
  dealCard: { marginRight: 12, borderRadius: 18 },
  dealCardCompact: { marginRight: 0 },
  dealCardInner: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  dealCardPressed: { opacity: 0.96 },
  dealImage: { width: "100%", height: 148, backgroundColor: colors.surface },
  dealImageCompact: { height: 104 },
  hotBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#e11d48",
    borderRadius: radii.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  hotBadgeText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  dealBody: { padding: 12, gap: 8 },
  dealBrand: { fontSize: 11, color: colors.gray500, fontWeight: "700" },
  dealName: { fontSize: 14, color: colors.gray900, fontWeight: "800", minHeight: 34 },
  dealPriceRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dealPrice: { fontSize: 16, color: colors.gray900, fontWeight: "800" },
  dealOriginalPrice: { fontSize: 12, color: colors.gray400, textDecorationLine: "line-through" },
  discountPill: { backgroundColor: "#3d1525", borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  discountPillText: { color: "#DC2626", fontWeight: "800", fontSize: 10 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#2d1525", borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 7 },
  timerLabel: { fontSize: 11, color: "#E11D48", fontWeight: "700" },
  timerValue: { marginLeft: "auto", fontSize: 12, color: "#BE123C", fontWeight: "800", letterSpacing: 0.3 },
  cardButtonsRow: { flexDirection: "row", gap: 8 },
  buyButton: { flex: 1, backgroundColor: colors.accent, borderRadius: radii.md, alignItems: "center", paddingVertical: 10 },
  buyButtonText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  visitButton: { flex: 1, borderWidth: 1, borderColor: colors.gray300, borderRadius: radii.md, alignItems: "center", paddingVertical: 10, backgroundColor: colors.surface },
  visitButtonText: { color: colors.gray700, fontSize: 11, fontWeight: "700" },
  listCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.xl, overflow: "hidden" },
  listRow: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  txnLabel: { fontSize: 13, fontWeight: "600", color: colors.gray900 },
  txnDate: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  txnAmount: { fontSize: 13, fontWeight: "700", color: colors.gray900 },
  emptyListText: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, color: colors.gray500 },
  infoText: { fontSize: 12, color: colors.gray500, marginBottom: 6 },
  errorText: { fontSize: 12, color: colors.error, marginBottom: 6 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.gray900 },
  emptySubtitle: { fontSize: 13, color: colors.gray500, textAlign: "center" },
});

export default Home;
