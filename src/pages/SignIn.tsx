import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import supabase from "../lib/supabaseClient";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(data);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard"); // or wherever you want to redirect
    }
  };

  return (
    <div className="min-h-screen">
      <div className="">
        <HomeButton />
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="w-100 p-8 border-transparent bg-slate-300/30 rounded-2xl text-white">
          <h2 className="text-3xl mb-6 text-center">sign in</h2>
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 bg-fuchsia-800/50 rounded-2xl"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 bg-fuchsia-800/50 rounded-2xl"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="p-2 bg-violet-600/50 rounded-xl border border-slate-300 hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "sign in"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-sm text-gray-400 hover:text-white"
            >
              Don't have an account? Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
