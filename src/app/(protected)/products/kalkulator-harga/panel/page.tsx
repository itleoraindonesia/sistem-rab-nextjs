"use client";

import { useRouter } from "next/navigation";
import { useMasterData } from "../../../../../context/MasterDataContext";
import { useRABForm } from "../../../../../hooks/useRABForm";
import LoadingState from "../../../../../components/form/LoadingState";
import ErrorState from "../../../../../components/form/ErrorState";
import FormRAB from "../../../../../components/form/FormRAB";

export default function FormRABPage() {
  const router = useRouter();
  const {
    panels,
    ongkir,
    loading: masterLoading,
  } = useMasterData();

  // Use custom hook (now includes calculation logic)
  const {
    control,
    handleSubmit,
    setValue,
    formState,
    loading,
    error,
    hasil,
    onSubmit,
  } = useRABForm();

  if (error) {
    return <ErrorState error={error} loadExistingData={() => {}} id='' />;
  }

  if (masterLoading || loading) {
    return <LoadingState />;
  }

  return (
    <FormRAB
      control={control}
      handleSubmit={handleSubmit}
      setValue={setValue}
      formState={formState}
      onSubmit={onSubmit}
      panels={panels}
      ongkir={ongkir}
      hasil={hasil}
      onBack={() => router.back()}
      title='Kalkulator Panel Lantai & Dinding'
    />
  );
}
