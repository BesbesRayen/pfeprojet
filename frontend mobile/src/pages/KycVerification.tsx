import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MobileLayout from "@/components/MobileLayout";
import { useAppNavigation } from "@/lib/app-navigation";
import { useAuth } from "@/lib/auth";
import { submitKycVerification, KycVerificationResult, UploadFileAsset } from "@/lib/api";
import { colors } from "@/lib/theme";

// ─── Color aliases (from shared theme) ─────────────────────────
const PRIMARY = colors.primary;
const PRIMARY_LIGHT = colors.primaryLight;
const GRAY_100 = colors.gray100;
const GRAY_300 = colors.gray300;
const GRAY_400 = colors.gray400;
const GRAY_500 = colors.gray500;
const GRAY_700 = colors.gray700;
const GRAY_900 = colors.gray900;
const WHITE = colors.white;
const GREEN = colors.success;
const RED = colors.error;

const TOTAL_STEPS = 5;

// ─── Types ──────────────────────────────────────────────────────
interface KycData {
  documentType: string;
  cinFront: UploadFileAsset | null;
  cinBack: UploadFileAsset | null;
  maritalStatus: string;
  numberOfChildren: number;
  monthlySalary: string;
  selfie: UploadFileAsset | null;
}

const initialData: KycData = {
  documentType: "national_id",
  cinFront: null,
  cinBack: null,
  maritalStatus: "",
  numberOfChildren: 0,
  monthlySalary: "",
  selfie: null,
};

// ─── Progress Bar ───────────────────────────────────────────────
const ProgressBar = ({ step }: { step: number }) => (
  <View style={s.progressContainer}>
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
    </View>
    <Text style={s.progressText}>Étape {step}/{TOTAL_STEPS}</Text>
  </View>
);

// ─── Step 1: Document Selection ─────────────────────────────────
const Step1 = ({ onNext }: { onNext: () => void }) => (
  <View style={s.stepContent}>
    <Text style={s.stepTitle}>Documents</Text>
    <Text style={s.stepSubtitle}>
      Sélectionnez un document de vérification valide et non expiré
    </Text>

    <View style={[s.card, s.cardSelected]}>
      <View style={s.cardRow}>
        <View style={s.cardIconBox}>
          <Text style={s.cardIcon}>🪪</Text>
        </View>
        <View style={s.cardTextCol}>
          <Text style={s.cardTitle}>Carte d'identité nationale</Text>
          <Text style={s.cardDesc}>Résidents et non-résidents de Tunisie</Text>
        </View>
        <View style={s.radioSelected} />
      </View>
    </View>

    <View style={[s.card, s.cardDisabled]}>
      <View style={s.cardRow}>
        <View style={[s.cardIconBox, { opacity: 0.4 }]}>
          <Text style={s.cardIcon}>🛂</Text>
        </View>
        <View style={s.cardTextCol}>
          <Text style={[s.cardTitle, { color: GRAY_400 }]}>Passeport</Text>
          <Text style={[s.cardDesc, { color: GRAY_400 }]}>Bientôt disponible</Text>
        </View>
        <View style={s.radioDisabled} />
      </View>
    </View>

    <View style={[s.card, s.cardDisabled]}>
      <View style={s.cardRow}>
        <View style={[s.cardIconBox, { opacity: 0.4 }]}>
          <Text style={s.cardIcon}>🚗</Text>
        </View>
        <View style={s.cardTextCol}>
          <Text style={[s.cardTitle, { color: GRAY_400 }]}>Permis de conduire</Text>
          <Text style={[s.cardDesc, { color: GRAY_400 }]}>Bientôt disponible</Text>
        </View>
        <View style={s.radioDisabled} />
      </View>
    </View>

    <View style={{ flex: 1, minHeight: 20 }} />
    <Pressable style={s.primaryBtn} onPress={onNext}>
      <Text style={s.primaryBtnText}>Suivant</Text>
    </Pressable>
  </View>
);

// ─── Step 2: Upload ID ──────────────────────────────────────────
const UploadZone = ({
  label,
  image,
  onPick,
}: {
  label: string;
  image: UploadFileAsset | null;
  onPick: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.7} style={s.uploadZone} onPress={onPick}>
    {image ? (
      <Image source={{ uri: image.uri }} style={s.uploadPreview} />
    ) : (
      <View style={s.uploadPlaceholder}>
        <Text style={s.uploadPlus}>+</Text>
        <Text style={s.uploadLabel}>{label}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const Step2 = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: KycData;
  onChange: (d: Partial<KycData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const pickImage = async (side: "cinFront" | "cinBack") => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission requise",
            "Veuillez autoriser l'accès à la galerie photo dans les paramètres."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onChange({
          [side]: {
            uri: asset.uri,
            fileName: asset.fileName ?? `${side}.jpg`,
            mimeType: asset.mimeType ?? "image/jpeg",
          },
        });
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ouvrir la galerie. Veuillez réessayer.");
      console.error("pickImage error:", err);
    }
  };

  return (
    <View style={s.stepContent}>
      <Text style={s.stepTitle}>Téléchargez votre pièce d'identité</Text>
      <Text style={s.stepSubtitle}>
        Assurez-vous que la photo est correctement centrée et de bonne qualité
      </Text>

      <Text style={s.fieldLabel}>Recto de la CIN</Text>
      <UploadZone label="Recto" image={data.cinFront} onPick={() => pickImage("cinFront")} />

      <Text style={s.fieldLabel}>Verso de la CIN</Text>
      <UploadZone label="Verso" image={data.cinBack} onPick={() => pickImage("cinBack")} />

      <View style={{ marginTop: 20 }} />
      <View style={s.btnRow}>
        <Pressable style={s.secondaryBtn} onPress={onBack}>
          <Text style={s.secondaryBtnText}>Retour</Text>
        </Pressable>
        <Pressable
          style={[s.primaryBtn, s.btnFlex, !(data.cinFront && data.cinBack) && s.btnDisabled]}
          onPress={onNext}
          disabled={!(data.cinFront && data.cinBack)}
        >
          <Text style={s.primaryBtnText}>Suivant</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Step 3: General Information ────────────────────────────────
const MARITAL_OPTIONS = ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve"];

const Step3 = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: KycData;
  onChange: (d: Partial<KycData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => (
  <View style={s.stepContent}>
    <Text style={s.stepTitle}>Informations générales</Text>
    <Text style={s.stepSubtitle}>Renseignez vos informations personnelles</Text>

    <Text style={s.fieldLabel}>Situation familiale</Text>
    <View style={s.optionGroup}>
      {MARITAL_OPTIONS.map((opt) => (
        <Pressable
          key={opt}
          style={[s.optionBtn, data.maritalStatus === opt && s.optionBtnActive]}
          onPress={() => onChange({ maritalStatus: opt })}
        >
          <Text style={[s.optionBtnText, data.maritalStatus === opt && s.optionBtnTextActive]}>
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>

    {data.maritalStatus === "Marié(e)" && (
      <>
        <Text style={s.fieldLabel}>Nombre d'enfants</Text>
        <View style={s.counterRow}>
          <Pressable
            style={s.counterBtn}
            onPress={() => onChange({ numberOfChildren: Math.max(0, data.numberOfChildren - 1) })}
          >
            <Text style={s.counterBtnText}>−</Text>
          </Pressable>
          <Text style={s.counterValue}>{data.numberOfChildren}</Text>
          <Pressable
            style={s.counterBtn}
            onPress={() => onChange({ numberOfChildren: data.numberOfChildren + 1 })}
          >
            <Text style={s.counterBtnText}>+</Text>
          </Pressable>
        </View>
      </>
    )}

    <Text style={s.fieldLabel}>Salaire mensuel (TND)</Text>
    <TextInput
      style={s.input}
      value={data.monthlySalary}
      onChangeText={(v) => onChange({ monthlySalary: v.replace(/[^0-9.]/g, "") })}
      placeholder="Ex: 2500"
      placeholderTextColor={GRAY_400}
      keyboardType="numeric"
    />

    <View style={{ marginTop: 20 }} />
    <View style={s.btnRow}>
      <Pressable style={s.secondaryBtn} onPress={onBack}>
        <Text style={s.secondaryBtnText}>Retour</Text>
      </Pressable>
      <Pressable
        style={[s.primaryBtn, s.btnFlex, !(data.maritalStatus && data.monthlySalary) && s.btnDisabled]}
        onPress={onNext}
        disabled={!(data.maritalStatus && data.monthlySalary)}
      >
        <Text style={s.primaryBtnText}>Suivant</Text>
      </Pressable>
    </View>
  </View>
);

// ─── Step 4: Selfie ─────────────────────────────────────────────
const Step4 = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: KycData;
  onChange: (d: Partial<KycData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const takeSelfie = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Veuillez autoriser l'accès à la caméra.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({
        selfie: {
          uri: asset.uri,
          fileName: "selfie.jpg",
          mimeType: asset.mimeType ?? "image/jpeg",
        },
      });
    }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ouvrir la caméra. Veuillez réessayer.");
      console.error("takeSelfie error:", err);
    }
  };

  return (
    <View style={s.stepContent}>
      <Text style={s.stepTitle}>Selfie</Text>
      <Text style={s.stepSubtitle}>
        Prenez un selfie clair. Votre visage doit être bien éclairé et centré.
      </Text>

      <View style={s.selfieContainer}>
        {data.selfie ? (
          <Image source={{ uri: data.selfie.uri }} style={s.selfiePreview} />
        ) : (
          <View style={s.selfiePlaceholder}>
            <Text style={s.selfieIcon}>📸</Text>
            <Text style={s.selfieHint}>Aucune photo prise</Text>
          </View>
        )}
      </View>

      <Pressable style={[s.primaryBtn, { marginTop: 16 }]} onPress={takeSelfie}>
        <Text style={s.primaryBtnText}>
          {data.selfie ? "Reprendre le selfie" : "Prendre un selfie"}
        </Text>
      </Pressable>

      <View style={{ marginTop: 20 }} />
      <View style={s.btnRow}>
        <Pressable style={s.secondaryBtn} onPress={onBack}>
          <Text style={s.secondaryBtnText}>Retour</Text>
        </Pressable>
        <Pressable
          style={[s.primaryBtn, s.btnFlex, !data.selfie && s.btnDisabled]}
          onPress={onNext}
          disabled={!data.selfie}
        >
          <Text style={s.primaryBtnText}>Suivant</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Step 5: Review & Submit ────────────────────────────────────
const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <View style={s.reviewRow}>
    <Text style={s.reviewLabel}>{label}</Text>
    <Text style={s.reviewValue}>{value}</Text>
  </View>
);

const Step6 = ({
  data,
  onBack,
  onSubmit,
  onEditStep,
  loading,
}: {
  data: KycData;
  onBack: () => void;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
  loading: boolean;
}) => (
  <View style={s.stepContent}>
    <Text style={s.stepTitle}>Vérification & Soumission</Text>
    <Text style={s.stepSubtitle}>Vérifiez vos informations avant d'envoyer</Text>

    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <Text style={s.reviewSectionTitle}>Document</Text>
        <Pressable onPress={() => onEditStep(1)}>
          <Text style={s.editLink}>Modifier</Text>
        </Pressable>
      </View>
      <ReviewRow label="Type" value="Carte d'identité nationale" />
    </View>

    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <Text style={s.reviewSectionTitle}>Pièces jointes</Text>
        <Pressable onPress={() => onEditStep(2)}>
          <Text style={s.editLink}>Modifier</Text>
        </Pressable>
      </View>
      <View style={s.reviewImages}>
        {data.cinFront && (
          <Image source={{ uri: data.cinFront.uri }} style={s.reviewThumb} />
        )}
        {data.cinBack && (
          <Image source={{ uri: data.cinBack.uri }} style={s.reviewThumb} />
        )}
        {data.selfie && (
          <Image source={{ uri: data.selfie.uri }} style={s.reviewThumbRound} />
        )}
      </View>
    </View>

    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <Text style={s.reviewSectionTitle}>Informations</Text>
        <Pressable onPress={() => onEditStep(3)}>
          <Text style={s.editLink}>Modifier</Text>
        </Pressable>
      </View>
      <ReviewRow label="Situation familiale" value={data.maritalStatus || "—"} />
      {data.maritalStatus === "Marié(e)" && (
        <ReviewRow label="Enfants" value={String(data.numberOfChildren)} />
      )}
      <ReviewRow label="Salaire mensuel" value={data.monthlySalary ? `${data.monthlySalary} TND` : "—"} />
    </View>

    <View style={{ marginTop: 20 }} />
    <View style={s.btnRow}>
      <Pressable style={s.secondaryBtn} onPress={onBack}>
        <Text style={s.secondaryBtnText}>Retour</Text>
      </Pressable>
      <Pressable
        style={[s.submitBtn, s.btnFlex, loading && s.btnDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={WHITE} size="small" />
        ) : (
          <Text style={s.primaryBtnText}>Soumettre la vérification</Text>
        )}
      </Pressable>
    </View>
  </View>
);

// ─── Result Screens ─────────────────────────────────────────────
const ConfidenceBar = ({ value }: { value: number }) => (
  <View style={s.confidenceContainer}>
    <View style={s.confidenceTrack}>
      <View
        style={[
          s.confidenceFill,
          {
            width: `${value}%`,
            backgroundColor: value >= 70 ? GREEN : value >= 50 ? "#f59e0b" : RED,
          },
        ]}
      />
    </View>
    <Text style={s.confidenceText}>{value}%</Text>
  </View>
);

const ApprovedScreen = ({
  result,
  onDone,
}: {
  result: KycVerificationResult;
  onDone: () => void;
}) => (
  <View style={s.resultContainer}>
    <View style={s.resultIconCircle}>
      <Text style={s.resultIconText}>✅</Text>
    </View>
    <Text style={s.resultTitle}>Vérification réussie !</Text>
    <Text style={s.resultMessage}>
      Votre identité a été vérifiée avec succès. Vous pouvez maintenant accéder à tous les services.
    </Text>

    <View style={s.resultCard}>
      <Text style={s.resultCardLabel}>Score de confiance</Text>
      <ConfidenceBar value={result.confidence} />
      <View style={s.resultRiskRow}>
        <Text style={s.resultCardLabel}>Niveau de risque</Text>
        <View style={[s.riskBadge, { backgroundColor: "#d1fae5" }]}>
          <Text style={[s.riskBadgeText, { color: "#065f46" }]}>
            {result.risk === "low" ? "Faible" : result.risk === "medium" ? "Moyen" : "Élevé"}
          </Text>
        </View>
      </View>
    </View>

    <Pressable style={s.primaryBtn} onPress={onDone}>
      <Text style={s.primaryBtnText}>Retour au profil</Text>
    </Pressable>
  </View>
);

const RejectedScreen = ({
  result,
  onRetry,
  onDone,
}: {
  result: KycVerificationResult;
  onRetry: () => void;
  onDone: () => void;
}) => (
  <View style={s.resultContainer}>
    <View style={[s.resultIconCircle, { backgroundColor: "#fee2e2" }]}>
      <Text style={s.resultIconText}>❌</Text>
    </View>
    <Text style={s.resultTitle}>Vérification refusée</Text>
    <Text style={s.resultMessage}>{result.message}</Text>

    <View style={s.resultCard}>
      <Text style={s.resultCardLabel}>Score de confiance</Text>
      <ConfidenceBar value={result.confidence} />
      <View style={s.resultRiskRow}>
        <Text style={s.resultCardLabel}>Niveau de risque</Text>
        <View style={[s.riskBadge, { backgroundColor: "#fee2e2" }]}>
          <Text style={[s.riskBadgeText, { color: "#991b1b" }]}>
            {result.risk === "high" ? "Élevé" : result.risk === "medium" ? "Moyen" : "Faible"}
          </Text>
        </View>
      </View>
    </View>

    <Pressable style={s.primaryBtn} onPress={onRetry}>
      <Text style={s.primaryBtnText}>Réessayer</Text>
    </Pressable>
    <Pressable style={[s.secondaryBtn, { marginTop: 10 }]} onPress={onDone}>
      <Text style={s.secondaryBtnText}>Retour au profil</Text>
    </Pressable>
  </View>
);

// ─── Main Component ─────────────────────────────────────────────
const KycVerification = () => {
  const { navigate } = useAppNavigation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<KycData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KycVerificationResult | null>(null);
  const [kycAlreadyApproved, setKycAlreadyApproved] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if KYC is already approved on mount
  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user) { setCheckingStatus(false); return; }
      try {
        const { getKycStatus } = await import("@/lib/api");
        const kycData = await getKycStatus(user.userId);
        if (kycData?.status === "APPROVED") {
          setKycAlreadyApproved(true);
        }
      } catch {
        // No KYC document found = not submitted yet, continue normally
      } finally {
        setCheckingStatus(false);
      }
    };
    checkKycStatus();
  }, [user]);

  const updateData = useCallback((partial: Partial<KycData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSubmit = async () => {
    if (!user || !data.cinFront || !data.cinBack) return;

    setLoading(true);
    setError(null);

    try {
      const res = await submitKycVerification(
        user.userId,
        data.cinFront,
        data.cinBack,
        data.selfie,
        data.maritalStatus,
        data.numberOfChildren,
        parseFloat(data.monthlySalary) || 0,
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setStep(1);
    setData(initialData);
  };

  // ── Result screens ──────────────────────────────────────────
  if (result) {
    return (
      <MobileLayout noPadding>
        <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent}>
          {result.status === "APPROVED" ? (
            <ApprovedScreen result={result} onDone={() => navigate("Profile")} />
          ) : (
            <RejectedScreen result={result} onRetry={handleRetry} onDone={() => navigate("Profile")} />
          )}
        </ScrollView>
      </MobileLayout>
    );
  }

  // ── Loading KYC status check ───────────────────────────────
  if (checkingStatus) {
    return (
      <MobileLayout noPadding>
        <View style={s.scrollContent}>
          <Text style={s.stepSubtitle}>Chargement...</Text>
        </View>
      </MobileLayout>
    );
  }

  // ── Already approved ──────────────────────────────────────
  if (kycAlreadyApproved) {
    return (
      <MobileLayout noPadding>
        <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent}>
          <View style={s.resultContainer}>
            <View style={s.resultIconCircle}>
              <Text style={s.resultIconText}>✅</Text>
            </View>
            <Text style={s.resultTitle}>Vérification complétée</Text>
            <Text style={s.resultMessage}>
              Votre identité a déjà été vérifiée avec succès. Vous avez accès à tous les services Creadi.
            </Text>
            <Pressable style={s.primaryBtn} onPress={() => navigate("Home")}>
              <Text style={s.primaryBtnText}>Retour à l'accueil</Text>
            </Pressable>
          </View>
        </ScrollView>
      </MobileLayout>
    );
  }

  // ── Step screens ────────────────────────────────────────────
  return (
    <MobileLayout noPadding>
      <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => navigate("Profile")}>
            <Text style={s.headerBack}>←</Text>
          </Pressable>
          <Text style={s.headerTitle}>Vérification KYC</Text>
          <View style={{ width: 24 }} />
        </View>

        <ProgressBar step={step} />

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {step === 1 && <Step1 onNext={() => setStep(2)} />}
        {step === 2 && (
          <Step2 data={data} onChange={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3 data={data} onChange={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <Step4 data={data} onChange={updateData} onNext={() => setStep(5)} onBack={() => setStep(3)} />
        )}
        {step === 5 && (
          <Step6
            data={data}
            onBack={() => setStep(4)}
            onSubmit={handleSubmit}
            onEditStep={(s) => setStep(s)}
            loading={loading}
          />
        )}
      </ScrollView>
    </MobileLayout>
  );
};

// ─── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: colors.pageBg },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 30, minHeight: '100%' },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerBack: { fontSize: 22, color: GRAY_700 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: GRAY_900 },

  // Progress
  progressContainer: { marginBottom: 20 },
  progressTrack: {
    height: 6,
    backgroundColor: GRAY_100,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: PRIMARY,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: GRAY_500,
    textAlign: "right",
  },

  // Steps shared
  stepContent: { gap: 12 },
  stepTitle: { fontSize: 20, fontWeight: "700", color: GRAY_900 },
  stepSubtitle: { fontSize: 13, color: GRAY_500, marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: GRAY_700, marginTop: 4 },

  // Cards (Step 1)
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  cardDisabled: { opacity: 0.5 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GRAY_100,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 22 },
  cardTextCol: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: GRAY_900 },
  cardDesc: { fontSize: 11, color: GRAY_500, marginTop: 2 },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 6,
    borderColor: PRIMARY,
    backgroundColor: colors.card,
  },
  radioDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY_300,
  },

  // Upload (Step 2)
  uploadZone: {
    borderWidth: 2,
    borderColor: GRAY_300,
    borderStyle: "dashed",
    borderRadius: 14,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: GRAY_100,
  },
  uploadPlaceholder: { alignItems: "center", gap: 6 },
  uploadPlus: { fontSize: 32, color: PRIMARY, fontWeight: "300" },
  uploadLabel: { fontSize: 13, color: GRAY_500 },
  uploadPreview: { width: "100%", height: "100%", resizeMode: "cover" },

  // Options (Step 3)
  optionGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: GRAY_100,
    borderWidth: 1,
    borderColor: GRAY_100,
  },
  optionBtnActive: { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY },
  optionBtnText: { fontSize: 13, color: GRAY_700 },
  optionBtnTextActive: { color: PRIMARY, fontWeight: "600" },

  // Counter (Step 3)
  counterRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GRAY_100,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: { fontSize: 18, fontWeight: "700", color: GRAY_700 },
  counterValue: { fontSize: 18, fontWeight: "700", color: GRAY_900, minWidth: 24, textAlign: "center" },

  // Input
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: GRAY_300,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: GRAY_900,
    backgroundColor: colors.gray50,
  },

  // Selfie (Step 4)
  selfieContainer: {
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: GRAY_100,
    borderWidth: 3,
    borderColor: PRIMARY,
    marginTop: 12,
  },
  selfiePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  selfieIcon: { fontSize: 40 },
  selfieHint: { fontSize: 12, color: GRAY_400 },
  selfiePreview: { width: "100%", height: "100%", resizeMode: "cover" },

  // Toggle (Step 5)
  toggleRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: GRAY_100,
    alignItems: "center",
    borderWidth: 2,
    borderColor: GRAY_100,
  },
  toggleBtnActive: { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY },
  toggleBtnActiveRed: { backgroundColor: "#2d1515", borderColor: RED },
  toggleBtnText: { fontSize: 15, fontWeight: "600", color: GRAY_700 },
  toggleBtnTextActive: { color: PRIMARY },
  warningBox: {
    backgroundColor: "#2d2410",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#92400e",
    marginTop: 8,
  },
  warningText: { fontSize: 12, color: "#fbbf24", lineHeight: 18 },

  // Review (Step 6)
  reviewCard: {
    backgroundColor: GRAY_100,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewSectionTitle: { fontSize: 14, fontWeight: "700", color: GRAY_900 },
  editLink: { fontSize: 12, color: PRIMARY, fontWeight: "600" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between" },
  reviewLabel: { fontSize: 13, color: GRAY_500 },
  reviewValue: { fontSize: 13, fontWeight: "600", color: GRAY_900 },
  reviewImages: { flexDirection: "row", gap: 10, marginTop: 4 },
  reviewThumb: { width: 60, height: 42, borderRadius: 8, backgroundColor: GRAY_300 },
  reviewThumbRound: { width: 42, height: 42, borderRadius: 21, backgroundColor: GRAY_300 },

  // Buttons
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtnText: { color: WHITE, fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryBtnText: { color: GRAY_700, fontWeight: "600", fontSize: 14 },
  submitBtn: { backgroundColor: GREEN },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  btnFlex: { flex: 1 },
  btnDisabled: { opacity: 0.5 },

  // Error
  errorBox: {
    backgroundColor: "#2d1515",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  errorText: { color: "#f87171", fontSize: 13 },

  // Result screens
  resultContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 16 },
  resultIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  resultIconText: { fontSize: 36 },
  resultTitle: { fontSize: 22, fontWeight: "700", color: GRAY_900, textAlign: "center" },
  resultMessage: {
    fontSize: 14,
    color: GRAY_500,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  resultCard: {
    width: "100%",
    backgroundColor: GRAY_100,
    borderRadius: 14,
    padding: 20,
    gap: 14,
    marginTop: 8,
  },
  resultCardLabel: { fontSize: 13, fontWeight: "600", color: GRAY_700 },
  resultRiskRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  riskBadgeText: { fontSize: 12, fontWeight: "700" },

  // Confidence bar
  confidenceContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  confidenceTrack: {
    flex: 1,
    height: 10,
    backgroundColor: GRAY_300,
    borderRadius: 5,
    overflow: "hidden",
  },
  confidenceFill: { height: 10, borderRadius: 5 },
  confidenceText: { fontSize: 15, fontWeight: "700", color: GRAY_900, width: 44, textAlign: "right" },
});

export default KycVerification;
