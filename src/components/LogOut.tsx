import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

export default function LogOut() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      navigate("/signin");
    }
  };
  return (
    <div>
      {" "}
      <button
        className="border p-2 rounded-xl border-transparent bg-slate-300/30 text-lg font-bold text-indigo-500"
        onClick={handleLogout}
      >
        log out
      </button>
    </div>
  );
}
