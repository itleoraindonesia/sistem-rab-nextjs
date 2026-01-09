import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Create styles
/* eslint-disable no-undef */
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: "18px", // Sesuai (Judul Dokumen)
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 15,
    textAlign: "center",
  },
  infoTable: {
    fontSize: "12px",
    width: "67%", // 2/3 of page width
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  infoLabel: {
    width: 80,
  },
  infoSeparator: {
    width: 10,
    textAlign: "center",
  },
  infoValue: {
    flex: 1,
  },
  logo: {
    fontFamily: "Helvetica-Bold",
    fontSize: "36px", // Sesuai (Logo)
    letterSpacing: -1,
    flex: 1,
  },
  logoAccent: {
    color: "#555",
    fontSize: "20px",
  },
  logoImage: {
    width: 120,
    height: 36,
    objectFit: "contain",
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#006400",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tableHeaderCell: {
    padding: 4,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "10px",
    textTransform: "uppercase",
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  tableHeaderCellFirst: {
    padding: 4,
    color: "white",
    fontWeight: "bold",
    textAlign: "center", // Center align all header text
    fontSize: "10px",
    textTransform: "uppercase",
    borderLeftWidth: 0, // Remove left border for first column
  },
  tableHeaderCellLast: {
    padding: 4,
    color: "white",
    fontWeight: "bold",
    textAlign: "center", // Center align all header text
    fontSize: "10px",
    textTransform: "uppercase",
    borderRightWidth: 0, // Remove right border for last column
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tableCell: {
    padding: 4,
    fontSize: "10px", // Match table header font size
    // TAMBAH border kanan di setiap sel isi
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  categoryHeader: {
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    borderLeftWidth: 0,
    borderRightWidth: 0,
    width: "100%",
  },
  categoryText: {
    fontSize: "10px", // UBAH: Dari 14 ke 13 (Agar konsisten dengan isi tabel)
    fontWeight: "bold",
    padding: 4,
    flex: 1, // Teks mengambil layar penuh
    // PASTI: Tidak ada border di teks ini
    borderRightWidth: 0,
  },
  separatorRow: {
    backgroundColor: "#f9f9f9",
    height: 20,
    // Remove all borders
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  totalRow: {
    backgroundColor: "#a9d18e",
    fontWeight: "bold",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  grandTotalRow: {
    backgroundColor: "#006400",
    color: "white",
    fontWeight: "bold",
    fontSize: "10px", // Sesuai (Grand Total)
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  noCell: {
    width: 30,
    textAlign: "center",
    borderLeftWidth: 0, // Remove left border to prevent doubling
  },
  descCell: {
    flex: 1,
    textAlign: "left",
  },
  unitCell: {
    width: 60,
    textAlign: "center",
  },
  qtyCell: {
    width: 70,
    textAlign: "center",
  },
  unitPriceCell: {
    width: 100,
    textAlign: "right",
  },
  amountCell: {
    width: 120,
    textAlign: "right",
    borderRightWidth: 0, // Remove right border to prevent doubling with table outer border
  },
  totalLabelCell: {
    textAlign: "right",
    fontWeight: "bold",
  },
});
/* eslint-enable no-undef */

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface RABItem {
  desc: string;
  qty: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface RABDocumentData {
  no_ref: string;
  project_name: string;
  location: string;
  location_kabupaten?: string;
  snapshot?: {
    items: RABItem[];
    total: number;
  };
}

interface RABDocumentProps {
  dokumen: RABDocumentData;
}

const RABDocument: React.FC<RABDocumentProps> = ({ dokumen }) => {
  if (!dokumen?.snapshot) return null;

  const {
    project_name,
    location_kabupaten,
    location,
    no_ref,
    snapshot: { total, items },
  } = dokumen;

  // Filter valid items
  const validItems = items.filter((item) => item.amount > 0);

  // Group items by category
  const groupedItems = validItems.reduce((acc, item) => {
    let category = "other";
    if (item.desc.toLowerCase().includes("dinding")) {
      category = "panel_dinding";
    } else if (item.desc.toLowerCase().includes("lantai")) {
      category = "panel_lantai";
    } else if (item.desc.toLowerCase().includes("ongkos kirim")) {
      category = "ongkos_kirim";
    }
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, RABItem[]>);

  const categoryConfig = [
    {
      key: "panel_dinding",
      label: "PANEL DINDING",
      hasItems: groupedItems.panel_dinding?.length > 0,
    },
    {
      key: "panel_lantai",
      label: "PANEL LANTAI",
      hasItems: groupedItems.panel_lantai?.length > 0,
    },
    {
      key: "ongkos_kirim",
      label: "ONGKOS KIRIM",
      hasItems: groupedItems.ongkos_kirim?.length > 0,
    },
    {
      key: "other",
      label: "BIAYA KIRIM",
      hasItems: groupedItems.other?.length > 0,
    },
  ].filter((cat) => cat.hasItems);

  let rowNumber = 1;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>RENCANA ANGGARAN BIAYA</Text>
            <View style={styles.infoTable}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No Ref</Text>
                <Text style={styles.infoSeparator}>:</Text>
                <Text style={styles.infoValue}>{no_ref}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Project</Text>
                <Text style={styles.infoSeparator}>:</Text>
                <Text style={styles.infoValue}>{project_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoSeparator}>:</Text>
                <Text style={styles.infoValue}>
                  {location_kabupaten || location}
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Image src='/Logo-Leora-PNG.png' style={styles.logoImage} />
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCellFirst, styles.noCell]}>NO</Text>
            <Text style={[styles.tableHeaderCell, styles.descCell]}>
              JOB DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderCell, styles.unitCell]}>UNIT</Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCell]}>
              QUANTITY
            </Text>
            <Text style={[styles.tableHeaderCell, styles.unitPriceCell]}>
              UNIT PRICE
            </Text>
            <Text style={[styles.tableHeaderCellLast, styles.amountCell]}>
              AMOUNT
            </Text>
          </View>

          {/* Table Body */}
          {categoryConfig.map((category, catIndex) => (
            <React.Fragment key={category.key}>
              {/* Category Header */}
              <View style={[styles.tableRow, styles.categoryHeader]}>
                <Text style={[styles.categoryText, { flex: 1 }]}>
                  {category.label}
                </Text>
              </View>

              {/* Category Items */}
              {groupedItems[category.key].map((item) => (
                <View
                  style={styles.tableRow}
                  key={`${category.key}-${rowNumber}`}
                >
                  <Text style={[styles.tableCell, styles.noCell]}>
                    {rowNumber}
                  </Text>
                  <Text style={[styles.tableCell, styles.descCell]}>
                    {item.desc}
                  </Text>
                  <Text style={[styles.tableCell, styles.unitCell]}>
                    {item.desc.toLowerCase().includes("ongkos kirim") ||
                    item.desc.toLowerCase().includes("truk")
                      ? "Unit"
                      : "Lembar"}
                  </Text>
                  <Text style={[styles.tableCell, styles.qtyCell]}>
                    {item.qty.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.unitPriceCell]}>
                    {formatCurrency(item.unit_price)}
                  </Text>
                  <Text style={[styles.tableCell, styles.amountCell]}>
                    {formatCurrency(item.amount)}
                  </Text>
                  {(() => {
                    rowNumber++;
                    return null;
                  })()}
                </View>
              ))}

              {/* Separator between categories */}
              {catIndex < categoryConfig.length - 1 && (
                <View style={[styles.tableRow, styles.separatorRow]}>
                  <Text></Text>
                </View>
              )}
            </React.Fragment>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "right", borderRightWidth: 0 },
              ]}
            ></Text>
            <Text
              style={[
                styles.tableCell,
                styles.amountCell,
                { borderRightWidth: 0 },
              ]}
            >
              {formatCurrency(total)}
            </Text>
          </View>

          {/* Grand Total Row */}
          <View style={[styles.tableRow, styles.grandTotalRow]}>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "right", borderRightWidth: 0 },
              ]}
            ></Text>
            <Text
              style={[
                styles.tableCell,
                styles.amountCell,
                { borderRightWidth: 0 },
              ]}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default RABDocument;
