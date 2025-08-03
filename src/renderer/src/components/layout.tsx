import { Outlet } from "react-router";
import { useEffect, useState } from "react";

export default function Layout() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.metaKey && e.key === "p") {
        setShow((prev) => !prev);
      }

      if (
        (e.key === "Escape" ||
          ((e.key === "g" || e.key === "c") && e.ctrlKey)) &&
        show
      ) {
        setShow(false);
        return;
      }
    };
  });

  return (
    <div className="w-screen h-screen bg-muted relative overflow-hidden">
      <Outlet />
    </div>
  );
}
