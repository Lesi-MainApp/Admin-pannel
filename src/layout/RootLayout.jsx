import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#F7F6F6] m-0 p-0 flex flex-col">
      <Outlet />
    </div>
  );
}

export default RootLayout;
