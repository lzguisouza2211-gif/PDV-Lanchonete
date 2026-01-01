import React, { ErrorInfo } from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: integrar com sentry/logging
  }

  render() {
    if (this.state.hasError) {
      return <h2>Algo deu errado.</h2>
    }
    return this.props.children as JSX.Element
  }
}
