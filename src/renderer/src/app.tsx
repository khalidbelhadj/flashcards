import Deck from "@/components/deck";
import Home from "@/components/home";
import { Route, Routes } from "react-router";
import { Review } from "./components/review";
import Layout from "@/components/layout";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/decks/:id" element={<Deck />} />
        <Route path="/decks/:id/review" element={<Review />} />
      </Route>
    </Routes>
  );
}
