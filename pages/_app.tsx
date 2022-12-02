import "../styles/globals.css";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-calendar/dist/Calendar.css';
import NextNProgress from "nextjs-progressbar";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";


function MyApp({ Component, pageProps }: AppProps<{
  session: Session;
}>) {

  
  return (
    <SessionProvider session={pageProps.session}>
      <Provider store={store}>
          <ToastContainer />
          <NextNProgress />
          <Component className="overflow-hidden" {...pageProps} />
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;
