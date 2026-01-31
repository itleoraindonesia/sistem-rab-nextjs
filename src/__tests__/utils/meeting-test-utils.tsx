import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

const MeetingTestProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a fresh query client for each render
  const [queryClient] = React.useState(() => createTestQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(ui, { wrapper: MeetingTestProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render, MeetingTestProviders }

