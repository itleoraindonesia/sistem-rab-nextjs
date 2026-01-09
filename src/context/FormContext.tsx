"use client";

import { createContext, useContext } from "react";

export interface FormContextType {
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext() {
  const context = useContext(FormContext);
  return context;
}

interface FormProviderProps {
  children: React.ReactNode;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function FormProvider({ children, onSubmittingChange }: FormProviderProps) {
  return (
    <FormContext.Provider value={{ onSubmittingChange }}>
      {children}
    </FormContext.Provider>
  );
}
