"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasterData } from "../../../../../context/MasterDataContext";
import { useRABEdit } from "../../../../../hooks/useRABEdit";
import LoadingState from "../../../../../components/form/LoadingState";
import ErrorState from "../../../../../components/form/ErrorState";
import FormRAB from "../../../../../components/form/FormRAB";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRABPage({ params }: PageProps) {
  const [id, setId] = useState<string>("");
  const router = useRouter();
  const { panels, ongkir, loading: masterLoading } = useMasterData();

  // Load params
  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId);
    });
  }, [params]);

  // Use custom edit hook
  const {
    control,
    handleSubmit,
    setValue,
    formState,
    loading,
    error,
    hasil,
    onSubmit,
    saveHandler,
    deleteHandler,
    originalStatus,
  } = useRABEdit(id);

  if (error) {
    return <ErrorState error={error} loadExistingData={() => {}} id={id} />;
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
      title='Edit RAB'
      isEdit={true}
      originalStatus={originalStatus}
    />
  );
}
