import { useState } from "react";
import type { FormEvent } from "react"; //The type keyword tells TypeScript this is only used for type checking, not at runtime.
import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import supabase from "../lib/supabaseClient";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); //Tells TypeScript that error can be either a string or null
  const navigate = useNavigate();

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    //Tells TypeScript that e is a form event
    e.preventDefault(); // Stops the form from refreshing the page
    setLoading(true); // Show loading state
    setError(null); // Clear any old errors

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    console.log(data);
    // This sends the email and password to Supabase, await means "wait for
    // Supabase to respond before continuing" Supabase returns either data
    // (success) or error (something went wrong)

    setLoading(false);

    if (error) {
      setError(error.message); // Show error to user
    } else {
      alert("Check your email for confirmation link!");
      navigate("/signin"); // Redirect to sign in page
    }
  };

  return (
    <div className="min-h-screen p-2">
      <HomeButton />
      <div className="p-4 flex justify-center items-center text-white">
        <div className="w-100 p-8 border-transparent bg-slate-300/30 rounded-2xl">
          <div className=" text-center">
            <h2 className="text-3xl mb-6">sign up</h2>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 bg-fuchsia-800/50 rounded-2xl"
              required
            />
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
              minLength={6}
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="p-2 bg-violet-600/50 rounded-xl border border-slate-300 hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "sign up"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-sm text-gray-400 hover:text-white"
            >
              Already have an account? Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
