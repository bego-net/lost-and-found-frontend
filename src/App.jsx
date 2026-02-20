import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateItem from "./pages/CreateItem";
import ItemDetails from "./pages/ItemDetails";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import EditItem from "./pages/EditItem";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchResults from "./pages/SearchResults";
import AdvancedSearch from "./pages/AdvancedSearch";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Conversation from "./pages/Conversation";


/* OWNER MESSAGE SYSTEM */
import MyItems from "./pages/MyItems";
import ItemMessages from "./pages/ItemMessages";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="p-4 min-h-screen"
      >
        <Routes location={location}>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ITEMS */}
          <Route path="/create" element={<CreateItem />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/item/edit/:id" element={<EditItem />} />

          {/* ITEM LISTS */}
          <Route path="/lost-items" element={<LostItems />} />
          <Route path="/found-items" element={<FoundItems />} />

          {/* SEARCH */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />

          {/* USER → OWNER CHAT */}
          <Route path="/chat/:itemId/:userId" element={<Chat />} />
          <Route path="/conversation/:itemId/:userId"element={<Conversation />} />

          {/* OWNER SIDE */}
          <Route path="/my-items" element={<MyItems />} />
          <Route
            path="/my-items/:itemId/messages"
            element={<ItemMessages />}
          />

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
}

export default App;
