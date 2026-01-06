# 🔴 MASALAH: Render Infinite Loop

Ada **3 masalah kritis** di kode Anda:

---

## **1. JSON.stringify di useMemo dependency ❌**

```typescript
// ❌ SALAH - JSON.stringify membuat object baru setiap render
const calculationResult = useMemo(() => {
  if (!panels.length || !watchedValues) return null;
  return calculateRAB(watchedValues);
}, [JSON.stringify(watchedValues), panels, calculateRAB]);
```

**Masalah:** `JSON.stringify(watchedValues)` membuat string baru setiap render, sehingga `useMemo` selalu re-compute.

### ✅ **FIX:**

```typescript
// Extract relevant values secara eksplisit
const calculationResult = useMemo(() => {
  if (!panels.length || !watchedValues) return null;
  return calculateRAB(watchedValues);
}, [
  watchedValues.bidang,
  watchedValues.perimeter,
  watchedValues.tinggi_lantai,
  watchedValues.hitung_dinding,
  watchedValues.hitung_lantai,
  watchedValues.location,
  watchedValues.panel_dinding_id,
  watchedValues.panel_lantai_id,
  panels,
  calculateRAB,
]);
```

---

## **2. setHasil di useEffect tetap bermasalah ⚠️**

```typescript
// ❌ Masih bisa loop jika setHasil tidak stable
useEffect(() => {
  if (calculationResult) {
    setHasil(calculationResult);
  }
}, [calculationResult]); // setHasil sudah dihapus, tapi bisa masih loop
```

**Solusi lebih baik:** Hapus `useEffect` ini! `hasil` sudah direturn dari `useRABCalculation`.

### ✅ **FIX:**

```typescript
// HAPUS useEffect ini sepenuhnya
// useEffect(() => {
//   if (calculationResult) {
//     setHasil(calculationResult);
//   }
// }, [calculationResult]);

// Langsung gunakan calculationResult
return (
  <div>
    {/* Ganti semua `hasil` dengan `calculationResult` */}
    <span>{formatRupiah(calculationResult?.grandTotal || 0)}</span>
  </div>
);
```

---

## **3. calculateRAB tidak stable (dari hook) 🔥**

`calculateRAB` dari `useRABCalculation` mungkin **tidak di-wrap dengan `useCallback`**, sehingga berubah setiap render.

### ✅ **FIX di useRABCalculation.ts:**

```typescript
export function useRABCalculation(...) {
  // Wrap dengan useCallback
  const calculateRAB = useCallback((values) => {
    // ... your calculation logic
  }, [panels, ongkir, parameters]); // stable dependencies

  return { calculateRAB, hasil, setHasil };
}
```

---

## 🎯 **SOLUSI LENGKAP (Copy-Paste):**

```typescript
// FormRAB.tsx
export default function FormRAB({ ... }) {
  const watchedValues = useWatch({ control });
  const { fields, remove, append: tambahBidang } = useFieldArray({
    control,
    name: "bidang",
  });

  const { calculateRAB } = useRABCalculation(
    panels,
    ongkir,
    {
      wasteFactor: 1.05,
      jointFactorDinding: 2.5,
      jointFactorLantai: 1.8,
      upahPasang: 50000,
      hargaJoint: 2500,
    },
    false
  );

  // ✅ FIX 1: Explicit dependencies, no JSON.stringify
  const calculationResult = useMemo(() => {
    if (!panels.length || !watchedValues) return null;
    return calculateRAB(watchedValues);
  }, [
    watchedValues.bidang,
    watchedValues.perimeter,
    watchedValues.tinggi_lantai,
    watchedValues.hitung_dinding,
    watchedValues.hitung_lantai,
    watchedValues.location,
    watchedValues.panel_dinding_id,
    watchedValues.panel_lantai_id,
    panels.length, // Hanya track length, bukan array
    calculateRAB
  ]);

  // ✅ FIX 2: HAPUS useEffect setHasil
  // Langsung gunakan calculationResult di JSX

  const formatRupiah = (angka: number) => ...

  return (
    <div>
      {/* ✅ FIX 3: Ganti semua `hasil` dengan `calculationResult` */}
      <span>{calculationResult?.luasLantai?.toFixed(2) || 0} m²</span>
      <span>{formatRupiah(calculationResult?.grandTotal || 0)}</span>
      {/* dst... */}
    </div>
  );
}
```

---

## 📋 **CHECKLIST PERBAIKAN:**

1. ✅ Ganti `JSON.stringify(watchedValues)` dengan dependencies eksplisit
2. ✅ Hapus `useEffect` yang call `setHasil`
3. ✅ Replace semua `hasil?.xxx` dengan `calculationResult?.xxx`
4. ✅ Pastikan `calculateRAB` di-wrap `useCallback` di hook-nya
5. ✅ Gunakan `panels.length` bukan `panels` di dependency

---

## 🚀 **HASIL AKHIR:**

- ❌ **Before:** 10-20 render per detik (infinite loop)
- ✅ **After:** 1 render per perubahan form (optimal)

Test dengan buka DevTools → **Components tab** → lihat render count!
