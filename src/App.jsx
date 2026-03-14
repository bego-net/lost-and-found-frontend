import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* Pages */
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const CreateItem = lazy(() => import("./pages/CreateItem"));
const ItemDetails = lazy(() => import("./pages/ItemDetails"));
const LostItems = lazy(() => import("./pages/LostItems"));
const FoundItems = lazy(() => import("./pages/FoundItems"));
const EditItem = lazy(() => import("./pages/EditItem"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Chat = lazy(() => import("./pages/Chat"));
const Conversation = lazy(() => import("./pages/Conversation"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));

/* OWNER MESSAGE SYSTEM */
const MyItems = lazy(() => import("./pages/MyItems"));
const ItemMessages = lazy(() => import("./pages/ItemMessages"));

const Safety = lazy(() => import("./pages/Safety"));
const Contact = lazy(() => import("./pages/Contact"));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen p-4"
      >
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
        <Routes location={location}>
          {/* ================= HOME ================= */}
          <Route path="/" element={<Home />} />

          {/* ================= AUTH ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* ================= ITEMS ================= */}
          <Route path="/create" element={<CreateItem />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/item/edit/:id" element={<EditItem />} />

          {/* ================= LISTS ================= */}
          <Route path="/lost-items" element={<LostItems />} />
          <Route path="/found-items" element={<FoundItems />} />

          {/* ================= SEARCH ================= */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />

          {/* ================= CHAT ================= */}
          {/* USER → OWNER CHAT */}
          <Route path="/chat/:itemId/:userId" element={<ItemMessages />} />

          {/* Optional conversation route */}
          <Route
            path="/conversation/:itemId/:userId"
            element={<Conversation />}
          />

          {/* ================= OWNER SIDE ================= */}
          <Route path="/my-items" element={<MyItems />} />
          <Route
            path="/my-items/:itemId/messages"
            element={<ItemMessages />}
          />

          {/* ================= PROFILE ================= */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          <Route path="/safety" element={<Safety />} />
          <Route path="/contact" element={<Contact />} />

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="flex-grow">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
