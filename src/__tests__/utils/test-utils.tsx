import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MasterDataProvider } from '../../context/MasterDataContext'
import { FormProvider } from '../../context/FormContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MasterDataProvider>
      <FormProvider>
        {children}
      </FormProvider>
    </MasterDataProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
