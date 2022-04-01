import 'styles/globals.css'
import type { AppProps } from 'next/app'
import { Fragment, FC } from 'react'
import { Provider } from 'react-redux'

import { store } from 'redux/store'

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <header>HEADER</header>
      <div id="subbody">
        <div id="contents">
          <nav>NAV</nav>
          <main>
            <Component {...pageProps} />
          </main>
        </div>
        <footer>FOOTER</footer>
      </div>
    </Provider>
  )
}

export default MyApp
