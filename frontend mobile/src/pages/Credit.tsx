import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import {
  CreditSimulationResult,
  getCreditBalance,
  CreditBalanceResult,
  getDashboard,
  requestCredit,
  simulateCredit,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppNavigation } from "@/lib/app-navigation";
import { colors, radii } from "@/lib/theme";

const toDt = (value: number) => `${Math.round(value)} DT`;

const Credit = () => {
  const { user, creditSyncVersion } = useAuth();
  const { navigate, params } = useAppNavigation();
  const [amount, setAmount] = useState(500);
  const [months, setMonths] = useState(3);
  const [confirmed, setConfirmed] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [simulation, setSimulation] = useState<CreditSimulationResult | null>(null);
  const [creditLimit, setCreditLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [blockingStep, setBlockingStep] = useState<"ADD_CARD" | "COMPLETE_FINANCIAL_PROFILE" | null>(null);

  const prefillAmount = Number(params?.prefillAmount ?? 0);
  const selectedProductName = String(params?.productName ?? "");

  const downPayment = useMemo(() => Math.round(amount * 0.2), [amount]);
  const monthlyPayment = Math.round(simulation?.monthlyAmount ?? amount / months);
  const totalCost = Math.round(simulation?.totalAmount ?? amount);
  const interestRates: Record<number, string> = { 3: "0%", 6: "3%", 9: "6%", 12: "12%" };
  const monthOptions = [3, 6, 9, 12];

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const [balanceData, dashboard] = await Promise.all([
            getCreditBalance(user.userId),
            getDashboard(user.userId),
          ]);
          setCreditLimit(balanceData.availableCredit);
          if (dashboard.nextStep === "ADD_CARD" || dashboard.nextStep === "COMPLETE_FINANCIAL_PROFILE") {
            setBlockingStep(dashboard.nextStep);
          }
        } catch {
          setCreditLimit(0);
        }
      }
    };

    loadData();
  }, [user, creditSyncVersion]);

  useEffect(() => {
    if (prefillAmount > 0) {
      setAmount(Math.round(prefillAmount));
    }
  }, [prefillAmount]);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const result = await simulateCredit({
          totalAmount: amount,
          downPayment,
          numberOfInstallments: months,
        });
        setSimulation(result);
      } catch {
        setSimulation(null);
      }
    };

    loadSimulation();
  }, [amount, downPayment, months]);

  const handleConfirmRequest = async () => {
    if (!user) {
      navigate("Login");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const result = await requestCredit(user.userId, {
        totalAmount: amount,
        downPayment,
        numberOfInstallments: months,
        productName: selectedProductName || undefined,
      });
      setRequestId(result.id);
      setConfirmed(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Demande de credit echouee.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <MobileLayout>
        <View style={styles.confirmedWrap}>
          <Text style={styles.confirmedTitle}>Session requise</Text>
          <Text style={styles.confirmedSub}>Connectez-vous pour faire une demande de credit.</Text>
          <Pressable onPress={() => navigate("Login")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Aller a la connexion</Text>
          </Pressable>
        </View>
      </MobileLayout>
    );
  }

  if (confirmed) {
    return (
      <MobileLayout>
        <View style={styles.confirmedWrap}>
          <View style={styles.confirmedIcon}><Text style={styles.confirmedIconText}>✓</Text></View>
          <View>
            <Text style={styles.confirmedTitle}>Demande Confirmee</Text>
            <Text style={styles.confirmedSub}>
              {toDt(amount)} en {months} mensualités
            </Text>
            {requestId !== null && <Text style={styles.confirmedSub}>{`Reference #${requestId}`}</Text>}
          </View>
          <Pressable onPress={() => setConfirmed(false)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Nouvelle Demande</Text>
          </Pressable>
        </View>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout noPadding>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Demande de Credit</Text>
        <Text style={styles.subtitle}>Simulez votre plan de paiement</Text>

        {creditLimit !== null && (
          <View style={styles.limitCard}>
            <Text style={styles.limitLabel}>Limite de credit autorisee</Text>
            <Text style={styles.limitValue}>{toDt(creditLimit)}</Text>
            {creditLimit <= 0 && (
              <Text style={styles.limitWarning}>Aucun crédit disponible. Vérifiez que votre KYC est approuvé et que votre salaire est renseigné.</Text>
            )}
          </View>
        )}

        {!!selectedProductName && (
          <View style={styles.prefillCard}>
            <Text style={styles.prefillTitle}>Achat Creadi</Text>
            <Text style={styles.prefillText}>{selectedProductName}</Text>
            <Text style={styles.prefillHint}>Montant pre-rempli depuis le produit selectionne.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Montant</Text>
          <Text style={styles.amount}>{toDt(amount)}</Text>
          <View style={styles.rangeRow}>
            {[100, 500, 1000, 2500, 5000].map((a) => (
              <Pressable
                key={a}
                style={[styles.amountChip, amount === a && styles.amountChipActive]}
                onPress={() => setAmount(a)}
              >
                <Text style={[styles.amountChipText, amount === a && styles.amountChipTextActive]}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.cardLabel}>Mensualites</Text>
          <View style={styles.monthRow}>
            {monthOptions.map((m) => (
              <Pressable key={m} style={[styles.monthChip, months === m && styles.monthChipActive]} onPress={() => setMonths(m)}>
                <Text style={[styles.monthChipText, months === m && styles.monthChipTextActive]}>{m} mois</Text>
                <Text style={[styles.monthChipInterest, months === m && { color: "rgba(255,255,255,0.75)" }]}>{interestRates[m]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resume</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Mensualite</Text><Text style={styles.summaryValue}>{toDt(monthlyPayment)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Apport</Text><Text style={styles.summaryValue}>{toDt(downPayment)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Total</Text><Text style={styles.summaryValue}>{toDt(totalCost)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Duree</Text><Text style={styles.summaryValue}>{months} mois</Text></View>
        </View>

        {creditLimit !== null && (amount - downPayment) > creditLimit && (
          <View style={styles.overLimitCard}>
            <Text style={styles.overLimitText}>Le montant restant ({toDt(amount - downPayment)}) depasse votre limite de credit ({toDt(creditLimit)}).</Text>
          </View>
        )}

        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <Pressable
          onPress={handleConfirmRequest}
          style={[
            styles.primaryButton,
            (loading || (creditLimit !== null && (amount - downPayment) > creditLimit) || (creditLimit !== null && creditLimit <= 0)) && styles.primaryButtonDisabled,
          ]}
          disabled={loading || (creditLimit !== null && (amount - downPayment) > creditLimit) || (creditLimit !== null && creditLimit <= 0)}
        >
          <Text style={styles.primaryButtonText}>{loading ? "Envoi en cours..." : "Confirmer la demande"}</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />

      {/* Blocking onboarding modal */}
      <Modal visible={!!blockingStep} transparent animationType="fade">
        <View style={styles.blockingOverlay}>
          <View style={styles.blockingCard}>
            <Text style={styles.blockingTitle}>
              {blockingStep === "ADD_CARD" ? "Payment card required" : "Financial profile required"}
            </Text>
            <Text style={styles.blockingDesc}>
              {blockingStep === "ADD_CARD"
                ? "You need to add a payment card before requesting credit."
                : "You need to complete your financial profile to access BNPL credit."}
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => { setBlockingStep(null); navigate(blockingStep === "ADD_CARD" ? "Cards" : "FinancialProfile"); }}
            >
              <Text style={styles.primaryButtonText}>
                {blockingStep === "ADD_CARD" ? "Add a Card" : "Complete Profile"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", color: colors.gray900 },
  subtitle: { marginTop: 4, fontSize: 14, color: colors.gray500 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.xl, padding: 14 },
  cardLabel: { fontSize: 12, color: colors.gray500, fontWeight: "700", textTransform: "uppercase" },
  amount: { marginTop: 10, fontSize: 30, fontWeight: "700", color: colors.gray900 },
  rangeRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amountChip: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  amountChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amountChipText: { fontSize: 12, fontWeight: "700", color: colors.gray700 },
  amountChipTextActive: { color: colors.white },
  monthRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  monthChip: { width: "23%", minWidth: 70, alignItems: "center", paddingVertical: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  monthChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChipText: { fontSize: 13, fontWeight: "700", color: colors.gray900 },
  monthChipTextActive: { color: colors.white },
  monthChipInterest: { fontSize: 10, color: colors.gray500, fontWeight: "600" },
  summaryCard: { borderRadius: radii.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, padding: 14, gap: 8 },
  summaryTitle: { color: colors.gray400, fontSize: 12, textTransform: "uppercase", fontWeight: "700" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryKey: { color: colors.gray400, fontSize: 13 },
  summaryValue: { color: colors.gray900, fontSize: 13, fontWeight: "700" },
  prefillCard: { borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.primaryBg, borderRadius: radii.lg, padding: 12, gap: 4 },
  prefillTitle: { fontSize: 11, color: colors.primary, fontWeight: "800", textTransform: "uppercase" },
  prefillText: { fontSize: 14, color: colors.gray900, fontWeight: "700" },
  prefillHint: { fontSize: 12, color: colors.gray500 },
  primaryButton: { marginTop: 4, backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 15, alignItems: "center", shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  limitCard: { backgroundColor: colors.primaryBg, borderWidth: 1, borderColor: colors.primary + "30", borderRadius: radii.lg, padding: 14, gap: 4 },
  limitLabel: { fontSize: 11, color: colors.primary, fontWeight: "700", textTransform: "uppercase" },
  limitValue: { fontSize: 20, fontWeight: "800", color: colors.primary },
  limitWarning: { fontSize: 12, color: colors.error, marginTop: 4 },
  overLimitCard: { backgroundColor: colors.errorLight, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: radii.lg, padding: 12 },
  overLimitText: { fontSize: 12, color: colors.error, fontWeight: "600" },
  confirmedWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  confirmedIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentLight, alignItems: "center", justifyContent: "center" },
  confirmedIconText: { fontSize: 40, color: colors.success },
  confirmedTitle: { textAlign: "center", fontSize: 22, fontWeight: "700", color: colors.gray900 },
  confirmedSub: { marginTop: 6, textAlign: "center", color: colors.gray500 },
  errorText: { marginTop: 2, color: colors.error, fontSize: 12 },
  blockingOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 24 },
  blockingCard: { backgroundColor: colors.card, borderRadius: radii.xl, padding: 24, gap: 12, width: "100%" },
  blockingTitle: { fontSize: 18, fontWeight: "700", color: colors.gray900 },
  blockingDesc: { fontSize: 14, color: colors.gray500, lineHeight: 20 },
});

export default Credit;
