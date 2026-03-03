import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const BRAND_COLOR = "#095540";

// Strip HTML tags to get plain text for PDF rendering
const stripHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// A4 usable width ≈ 515pt (595 - 80pt padding)
// metaLeft: label + sep + value. metaRight: date text.
const META_LABEL_W  = 58;
const META_SEP_W    = 12;
const META_VALUE_W  = 210;
const META_LEFT_W   = META_LABEL_W + META_SEP_W + META_VALUE_W; // 280
const META_RIGHT_W  = 180;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 11,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 14,
    borderBottomWidth: 4,
    borderBottomColor: BRAND_COLOR,
    marginBottom: 22,
  },
  companySection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: BRAND_COLOR,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
  },
  companyContact: {
    fontSize: 9,
    color: "#666666",
    textAlign: "right",
  },

  // ── Content area ────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingBottom: 56,
  },

  // ── Meta section ────────────────────────────────────────
  metaSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  metaLeft: {
    flexDirection: "column",
    width: META_LEFT_W,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    width: META_LABEL_W,
    fontSize: 11,
  },
  metaSeparator: {
    width: META_SEP_W,
    fontSize: 11,
    textAlign: "center",
  },
  metaValue: {
    width: META_VALUE_W,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  metaRight: {
    width: META_RIGHT_W,
    fontSize: 11,
    textAlign: "right",
  },

  // ── Recipient ───────────────────────────────────────────
  recipient: {
    marginBottom: 18,
  },
  recipientLine: {
    fontSize: 11,
    marginBottom: 2,
  },
  recipientBold: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },

  // ── Body ────────────────────────────────────────────────
  bodySection: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 10,
  },

  // ── Signature ───────────────────────────────────────────
  signatureWrapper: {
    marginTop: 48,
    paddingHorizontal: 20,
  },
  signatureRow: {
    flexDirection: "row",
  },
  signatureBlock: {
    alignItems: "center",
    minWidth: 130,
  },
  signatureLabel: {
    fontSize: 11,
    marginBottom: 42,
    textAlign: "center",
  },
  signatureLine: {
    borderTopWidth: 1.5,
    borderTopColor: "#333333",
    paddingTop: 5,
    minWidth: 150,
    alignItems: "center",
  },
  signatureName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 10,
    color: "#555555",
    textAlign: "center",
  },

  // ── Footer ──────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: BRAND_COLOR,
    paddingTop: 7,
  },
  footerText: {
    fontSize: 9,
    color: "#666666",
  },
});

interface Signatory {
  name?: string;
  position?: string;
  pihak?: string;
  order?: number;
}

interface LetterPDFDocumentProps {
  letter: {
    document_number?: string | null;
    subject?: string | null;
    letter_date?: string | null;
    recipient_name?: string | null;
    recipient_company?: string | null;
    recipient_address?: string | null;
    opening?: string | null;
    body?: string | null;
    closing?: string | null;
    company?: {
      nama?: string | null;
      alamat?: string | null;
      telepon?: string | null;
      email?: string | null;
    } | null;
    sender?: {
      nama?: string | null;
      jabatan?: string | null;
      departemen?: string | null;
    } | null;
    created_by?: {
      nama?: string | null;
    } | null;
    signatories?: Signatory[] | null;
  };
  attachments?: Array<{ name: string }> | null;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const LetterPDFDocument: React.FC<LetterPDFDocumentProps> = ({
  letter,
  attachments,
}) => {
  const companyInitial = letter.company?.nama?.charAt(0).toUpperCase() || "L";

  const signatories: Signatory[] =
    Array.isArray(letter.signatories) && letter.signatories.length > 0
      ? [...letter.signatories].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [];

  const hasSignatories = signatories.length > 0;
  const isMultipleSig  = signatories.length > 1;

  const bodyText = stripHtml(letter.body);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ─────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>{companyInitial}</Text>
            </View>
            <Text style={styles.companyName}>{letter.company?.nama || "-"}</Text>
          </View>
          <View style={styles.companyContact}>
            {letter.company?.alamat  ? <Text>{letter.company.alamat}</Text>            : null}
            {letter.company?.telepon ? <Text>Tel: {letter.company.telepon}</Text>      : null}
            {letter.company?.email   ? <Text>Email: {letter.company.email}</Text>      : null}
          </View>
        </View>

        {/* ── CONTENT ────────────────────────────────── */}
        <View style={styles.content}>

          {/* Meta: Nomor / Lampiran / Perihal  +  Tanggal */}
          <View style={styles.metaSection}>
            <View style={styles.metaLeft}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Nomor</Text>
                <Text style={styles.metaSeparator}>:</Text>
                <Text style={styles.metaValue}>{letter.document_number || "Pending"}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Lampiran</Text>
                <Text style={styles.metaSeparator}>:</Text>
                <Text style={styles.metaValue}>
                  {attachments && attachments.length > 0 ? `${attachments.length} file` : "-"}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Perihal</Text>
                <Text style={styles.metaSeparator}>:</Text>
                <Text style={styles.metaValue}>{letter.subject || "-"}</Text>
              </View>
            </View>
            <View style={styles.metaRight}>
              <Text>Jakarta, {formatDate(letter.letter_date)}</Text>
            </View>
          </View>

          {/* Recipient */}
          <View style={styles.recipient}>
            <Text style={styles.recipientLine}>Kepada Yth,</Text>
            {letter.recipient_name    ? <Text style={styles.recipientBold}>{letter.recipient_name}</Text>    : null}
            {letter.recipient_company ? <Text style={styles.recipientBold}>{letter.recipient_company}</Text> : null}
            {letter.recipient_address ? <Text style={styles.recipientLine}>{letter.recipient_address}</Text> : null}
          </View>

          {/* Body */}
          <View style={styles.bodySection}>
            {letter.opening ? <Text style={styles.paragraph}>{letter.opening}</Text> : null}
            {bodyText       ? <Text style={styles.paragraph}>{bodyText}</Text>       : null}
            {letter.closing ? <Text style={styles.paragraph}>{letter.closing}</Text> : null}
          </View>

          {/* Signature */}
          <View style={styles.signatureWrapper}>
            {hasSignatories ? (
              <View
                style={[
                  styles.signatureRow,
                  isMultipleSig
                    ? { justifyContent: "space-between" }
                    : { justifyContent: "flex-end" },
                ]}
              >
                {signatories.map((sig, i) => (
                  <View key={i} style={styles.signatureBlock}>
                    <Text style={styles.signatureLabel}>
                      {sig.pihak || (!isMultipleSig && i === 0 ? "Hormat kami," : "")}
                    </Text>
                    <View style={styles.signatureLine}>
                      <Text style={styles.signatureName}>{sig.name    || "-"}</Text>
                      <Text style={styles.signatureTitle}>{sig.position || ""}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              /* Fallback: sender / created_by */
              <View style={[styles.signatureRow, { justifyContent: "flex-end" }]}>
                <View style={styles.signatureBlock}>
                  <Text style={styles.signatureLabel}>Hormat kami,</Text>
                  <View style={styles.signatureLine}>
                    <Text style={styles.signatureName}>
                      {letter.sender?.nama || letter.created_by?.nama || "-"}
                    </Text>
                    <Text style={styles.signatureTitle}>
                      {letter.sender?.jabatan || "Staff"}
                    </Text>
                    {(letter.sender?.departemen || letter.company?.nama) ? (
                      <Text style={styles.signatureTitle}>
                        {letter.sender?.departemen || letter.company?.nama}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── FOOTER ─────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {letter.company?.nama || "-"} - All Rights Reserved
          </Text>
          <Text style={styles.footerText}>Halaman 1 dari 1</Text>
        </View>

      </Page>
    </Document>
  );
};
