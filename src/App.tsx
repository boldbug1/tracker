import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ClockProvider } from "./context/ClockContext";

import { FocusProvider } from "./context/FocusContext";
import { CookieConsentProvider } from "./components/ui/cookie-consent";

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <ClockProvider>
          <FocusProvider>
            <CookieConsentProvider>
              <RouterProvider router={router} />
            </CookieConsentProvider>
          </FocusProvider>
        </ClockProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
